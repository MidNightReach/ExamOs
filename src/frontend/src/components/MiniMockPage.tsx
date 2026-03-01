import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  Loader2,
  Lock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PYQQuestion } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import {
  useGetQuestions,
  useGetWeeklyMockCount,
  useIncrementWeeklyMockCount,
  useSaveMockResult,
  useUpdatePerformanceWeakness,
} from "../hooks/useQueries";

const PRIMARY = "oklch(0.72 0.17 195)";
const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const MOCK_TOTAL = 30;
const MOCK_PER_SUBJECT = 10;
const MOCK_DURATION_SECONDS = 3 * 60 * 60; // 3 hours

type MockPhase = "start" | "active" | "results";

interface MockAnswer {
  questionId: string;
  selectedOption: string | null;
}

interface SubjectResult {
  correct: number;
  attempted: number;
  total: number;
  score: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function selectQuestions(allQuestions: PYQQuestion[]): PYQQuestion[] {
  const subjects = ["Physics", "Chemistry", "Maths"];
  const selected: PYQQuestion[] = [];

  for (const subject of subjects) {
    const pool = allQuestions.filter((q) => q.subject === subject);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    selected.push(
      ...shuffled.slice(0, Math.min(MOCK_PER_SUBJECT, shuffled.length)),
    );
  }

  // If not enough questions per subject, fill from others
  if (selected.length < MOCK_TOTAL) {
    const remaining = allQuestions.filter(
      (q) => !selected.some((s) => s.id === q.id),
    );
    const extraNeeded = MOCK_TOTAL - selected.length;
    selected.push(...remaining.slice(0, extraNeeded));
  }

  return selected.slice(0, MOCK_TOTAL);
}

function computeResults(
  questions: PYQQuestion[],
  answers: MockAnswer[],
): {
  totalScore: number;
  totalAttempted: number;
  accuracy: number;
  subjects: Record<string, SubjectResult>;
  weakChapters: { chapter: string; accuracy: number }[];
} {
  const subjects: Record<string, SubjectResult> = {
    Physics: { correct: 0, attempted: 0, total: 0, score: 0 },
    Chemistry: { correct: 0, attempted: 0, total: 0, score: 0 },
    Maths: { correct: 0, attempted: 0, total: 0, score: 0 },
  };

  const chapterMap: Record<string, { correct: number; total: number }> = {};
  let totalScore = 0;
  let totalAttempted = 0;
  let totalCorrect = 0;

  for (const q of questions) {
    const answer = answers.find((a) => a.questionId === q.id);
    const subj = q.subject in subjects ? q.subject : "Physics";
    subjects[subj].total++;

    if (!chapterMap[q.chapter]) {
      chapterMap[q.chapter] = { correct: 0, total: 0 };
    }
    chapterMap[q.chapter].total++;

    if (answer?.selectedOption) {
      totalAttempted++;
      subjects[subj].attempted++;
      const isCorrect = answer.selectedOption === q.correctOption;
      if (isCorrect) {
        totalScore += 4;
        subjects[subj].score += 4;
        subjects[subj].correct++;
        totalCorrect++;
        chapterMap[q.chapter].correct++;
      } else {
        totalScore -= 1;
        subjects[subj].score -= 1;
      }
    }
  }

  const accuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const weakChapters = Object.entries(chapterMap)
    .filter(([, v]) => v.total > 0)
    .map(([chapter, v]) => ({
      chapter,
      accuracy: Math.round((v.correct / v.total) * 100),
    }))
    .filter(({ accuracy }) => accuracy < 50);

  return { totalScore, totalAttempted, accuracy, subjects, weakChapters };
}

interface MiniMockPageProps {
  proStatus: ProStatus;
  onUpgrade: () => void;
  onGoToDashboard: () => void;
}

export default function MiniMockPage({
  proStatus,
  onUpgrade,
  onGoToDashboard,
}: MiniMockPageProps) {
  const [phase, setPhase] = useState<MockPhase>("start");
  const [mockQuestions, setMockQuestions] = useState<PYQQuestion[]>([]);
  const [answers, setAnswers] = useState<MockAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MOCK_DURATION_SECONDS);
  const [results, setResults] = useState<ReturnType<
    typeof computeResults
  > | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: allQuestions = [], isLoading: questionsLoading } =
    useGetQuestions();
  const { data: weeklyMockCountData } = useGetWeeklyMockCount();
  const incrementWeeklyMock = useIncrementWeeklyMockCount();
  const saveMockResult = useSaveMockResult();
  const updateWeakness = useUpdatePerformanceWeakness();

  const weeklyMockCount = Number(weeklyMockCountData ?? 0);
  const canStartMock = proStatus.isPro || weeklyMockCount < 1;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const submitTest = useCallback(
    async (currentAnswers: MockAnswer[], questions: PYQQuestion[]) => {
      stopTimer();
      const result = computeResults(questions, currentAnswers);
      setResults(result);
      setPhase("results");

      // Save results & update counts
      try {
        const physicsCorrect = BigInt(result.subjects.Physics?.correct ?? 0);
        const chemCorrect = BigInt(result.subjects.Chemistry?.correct ?? 0);
        const mathsCorrect = BigInt(result.subjects.Maths?.correct ?? 0);
        const totalQ = BigInt(questions.length);
        const score = BigInt(result.totalScore);

        await Promise.all([
          saveMockResult.mutateAsync({
            score,
            totalQuestions: totalQ,
            accuracy: result.accuracy,
            physicsCorrect,
            chemCorrect,
            mathsCorrect,
          }),
          incrementWeeklyMock.mutateAsync(),
          ...result.weakChapters.map((wc) =>
            updateWeakness.mutateAsync({
              chapterName: wc.chapter,
              accuracy: wc.accuracy,
            }),
          ),
        ]);
      } catch {
        // Non-critical — results already shown
      }
    },
    [stopTimer, saveMockResult, incrementWeeklyMock, updateWeakness],
  );

  const startTest = useCallback(() => {
    if (allQuestions.length === 0) {
      toast.error("No questions available. Please seed questions in Admin.");
      return;
    }

    const selected = selectQuestions(allQuestions);
    if (selected.length === 0) {
      toast.error("Not enough questions available.");
      return;
    }

    const initialAnswers: MockAnswer[] = selected.map((q) => ({
      questionId: q.id,
      selectedOption: null,
    }));

    setMockQuestions(selected);
    setAnswers(initialAnswers);
    setCurrentIndex(0);
    setTimeLeft(MOCK_DURATION_SECONDS);
    setPhase("active");

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit
          submitTest(initialAnswers, selected);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [allQuestions, submitTest]);

  const handleAnswerSelect = useCallback(
    (questionId: string, option: string) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a.questionId === questionId
            ? {
                ...a,
                selectedOption: a.selectedOption === option ? null : option,
              }
            : a,
        ),
      );
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    submitTest(answers, mockQuestions);
  }, [answers, mockQuestions, submitTest]);

  const handleRetake = () => {
    stopTimer();
    setPhase("start");
    setResults(null);
    setAnswers([]);
    setMockQuestions([]);
    setCurrentIndex(0);
    setTimeLeft(MOCK_DURATION_SECONDS);
  };

  const currentQuestion = mockQuestions[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );
  const answeredCount = answers.filter((a) => a.selectedOption !== null).length;

  const timerWarning = timeLeft < 600; // < 10 minutes

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <ClipboardList className="w-5 h-5" style={{ color: PRIMARY }} />
            <h1
              className="font-display font-bold text-xl"
              style={{
                color: "oklch(0.92 0.01 250)",
                letterSpacing: "-0.02em",
              }}
            >
              Mini Mock Test
            </h1>
          </div>
          <p
            className="text-xs font-body"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            30 questions · JEE marking scheme · 3 hours
          </p>
        </div>

        {phase === "active" && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold"
            style={{
              background: timerWarning
                ? "oklch(0.65 0.23 25 / 0.1)"
                : "oklch(0.72 0.17 195 / 0.08)",
              border: timerWarning
                ? "1px solid oklch(0.65 0.23 25 / 0.3)"
                : "1px solid oklch(0.72 0.17 195 / 0.2)",
              color: timerWarning ? "oklch(0.65 0.23 25)" : PRIMARY,
            }}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Free tier gate */}
      {!canStartMock && phase === "start" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-center"
          style={{
            background: "oklch(0.15 0.018 250)",
            border: "1px solid oklch(0.72 0.17 195 / 0.25)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "oklch(0.72 0.17 195 / 0.12)",
              border: "1px solid oklch(0.72 0.17 195 / 0.3)",
            }}
          >
            <Lock className="w-7 h-7" style={{ color: PRIMARY }} />
          </div>
          <h3
            className="font-display font-bold text-lg mb-2"
            style={{ color: "oklch(0.92 0.01 250)" }}
          >
            Weekly Limit Reached
          </h3>
          <p
            className="font-body text-sm mb-6 max-w-xs mx-auto"
            style={{ color: "oklch(0.58 0.012 250)" }}
          >
            Free users can take 1 mini mock per week. Upgrade to Pro for
            unlimited mocks.
          </p>
          <Button
            onClick={onUpgrade}
            className="font-display font-bold h-10 px-6"
            style={{
              background: PRIMARY,
              color: "oklch(0.10 0.02 250)",
              boxShadow: "0 0 20px oklch(0.72 0.17 195 / 0.25)",
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </motion.div>
      )}

      {/* Start Screen */}
      {phase === "start" && canStartMock && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: "oklch(0.16 0.018 250)",
            border: "1px solid oklch(0.26 0.02 250)",
          }}
        >
          <div className="text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2
              className="font-display font-bold text-2xl mb-2"
              style={{
                color: "oklch(0.92 0.01 250)",
                letterSpacing: "-0.02em",
              }}
            >
              JEE Mini Mock Test
            </h2>
            <p
              className="font-body text-sm max-w-md mx-auto"
              style={{ color: "oklch(0.58 0.012 250)" }}
            >
              Simulate real JEE exam conditions with 30 questions from all three
              subjects. Adaptive results will update your weakness scores.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Questions", value: "30" },
              { label: "Duration", value: "3 hrs" },
              { label: "Marking", value: "+4 / −1" },
              { label: "Subjects", value: "P + C + M" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "oklch(0.20 0.02 250)",
                  border: "1px solid oklch(0.28 0.02 250)",
                }}
              >
                <div
                  className="font-mono font-bold text-lg"
                  style={{ color: PRIMARY }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs font-body mt-0.5"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={startTest}
              disabled={questionsLoading}
              className="font-display font-bold h-12 px-10 text-base"
              style={{
                background: PRIMARY,
                color: "oklch(0.10 0.02 250)",
                boxShadow: "0 0 24px oklch(0.72 0.17 195 / 0.3)",
              }}
            >
              {questionsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {questionsLoading ? "Loading questions..." : "Start Mock Test"}
            </Button>
            {!proStatus.isPro && (
              <p
                className="text-xs font-body mt-3"
                style={{ color: "oklch(0.42 0.012 250)" }}
              >
                {weeklyMockCount === 0
                  ? "Free: 1 mock available this week"
                  : "Free: limit used — upgrade for unlimited"}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Active Test */}
      {phase === "active" && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mock-q-${currentIndex}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(0.16 0.018 250)",
                  border: "1px solid oklch(0.26 0.02 250)",
                }}
              >
                {/* Question meta */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{
                      background: "oklch(0.72 0.17 195 / 0.1)",
                      color: PRIMARY,
                    }}
                  >
                    Q{currentIndex + 1}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-display font-medium"
                    style={{
                      background:
                        currentQuestion.subject === "Physics"
                          ? "oklch(0.65 0.18 240 / 0.12)"
                          : currentQuestion.subject === "Chemistry"
                            ? "oklch(0.65 0.18 145 / 0.12)"
                            : "oklch(0.70 0.17 60 / 0.12)",
                      color:
                        currentQuestion.subject === "Physics"
                          ? "oklch(0.65 0.18 240)"
                          : currentQuestion.subject === "Chemistry"
                            ? "oklch(0.65 0.18 145)"
                            : "oklch(0.70 0.17 60)",
                    }}
                  >
                    {currentQuestion.subject}
                  </span>
                  <span
                    className="text-xs font-body"
                    style={{ color: "oklch(0.45 0.012 250)" }}
                  >
                    {currentQuestion.chapter}
                  </span>
                </div>

                <p
                  className="font-body text-base leading-relaxed mb-5"
                  style={{ color: "oklch(0.90 0.008 250)" }}
                >
                  {currentQuestion.questionText}
                </p>

                {/* Options */}
                <div className="space-y-2.5">
                  {(["optionA", "optionB", "optionC", "optionD"] as const).map(
                    (optionKey, i) => {
                      const label = OPTION_LABELS[i];
                      const optionText = currentQuestion[optionKey];
                      const isSelected =
                        currentAnswer?.selectedOption === label;

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            handleAnswerSelect(currentQuestion.id, label)
                          }
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                          style={{
                            background: isSelected
                              ? "oklch(0.72 0.17 195 / 0.12)"
                              : "oklch(0.19 0.02 250)",
                            border: isSelected
                              ? `1px solid ${PRIMARY}`
                              : "1px solid oklch(0.28 0.02 250)",
                          }}
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
                            style={{
                              background: isSelected
                                ? "oklch(0.72 0.17 195 / 0.2)"
                                : "oklch(0.25 0.02 250)",
                              color: isSelected
                                ? PRIMARY
                                : "oklch(0.60 0.015 250)",
                              border: isSelected
                                ? `1px solid ${PRIMARY}`
                                : "1px solid oklch(0.32 0.02 250)",
                            }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-sm font-body leading-snug"
                            style={{
                              color: isSelected
                                ? "oklch(0.88 0.008 250)"
                                : "oklch(0.75 0.008 250)",
                            }}
                          >
                            {optionText}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="font-display font-medium h-9 px-4"
                style={{
                  border: "1px solid oklch(0.28 0.02 250)",
                  color: "oklch(0.70 0.012 250)",
                }}
              >
                ← Previous
              </Button>

              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.48 0.012 250)" }}
              >
                {answeredCount}/{mockQuestions.length} answered
              </span>

              {currentIndex < mockQuestions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="font-display font-medium h-9 px-4"
                  style={{
                    background: PRIMARY,
                    color: "oklch(0.10 0.02 250)",
                  }}
                >
                  Next →
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="font-display font-semibold h-9 px-4"
                      style={{
                        background: "oklch(0.72 0.17 145)",
                        color: "oklch(0.10 0.02 145)",
                      }}
                    >
                      Submit Test
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Submit Test?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-body">
                        You have answered {answeredCount} out of{" "}
                        {mockQuestions.length} questions.{" "}
                        {mockQuestions.length - answeredCount > 0 &&
                          `${mockQuestions.length - answeredCount} questions are unanswered. `}
                        Are you sure you want to submit?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-display">
                        Continue Test
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        className="font-display font-bold"
                        style={{
                          background: PRIMARY,
                          color: "oklch(0.10 0.02 250)",
                        }}
                      >
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Submit button in middle of test too */}
            {currentIndex < mockQuestions.length - 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-display font-medium h-9"
                    style={{
                      border: "1px solid oklch(0.72 0.17 145 / 0.4)",
                      color: "oklch(0.72 0.17 145)",
                    }}
                  >
                    Submit Test Early
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Submit Test?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      You have answered {answeredCount} out of{" "}
                      {mockQuestions.length} questions.{" "}
                      {mockQuestions.length - answeredCount > 0 &&
                        `${mockQuestions.length - answeredCount} questions are unanswered. `}
                      Are you sure you want to submit?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-display">
                      Continue Test
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      className="font-display font-bold"
                      style={{
                        background: PRIMARY,
                        color: "oklch(0.10 0.02 250)",
                      }}
                    >
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Question Grid Sidebar */}
          <div
            className="rounded-2xl p-4 h-fit sticky top-4"
            style={{
              background: "oklch(0.15 0.016 250)",
              border: "1px solid oklch(0.24 0.02 250)",
            }}
          >
            <p
              className="text-xs font-display font-semibold uppercase tracking-wider mb-3"
              style={{ color: "oklch(0.55 0.012 250)" }}
            >
              Question Grid
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {mockQuestions.map((q, i) => {
                const ans = answers.find((a) => a.questionId === q.id);
                const isAnswered = !!ans?.selectedOption;
                const isCurrent = i === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className="w-full aspect-square rounded-md text-xs font-mono font-bold flex items-center justify-center transition-all"
                    style={{
                      background: isCurrent
                        ? PRIMARY
                        : isAnswered
                          ? "oklch(0.72 0.17 195 / 0.2)"
                          : "oklch(0.22 0.02 250)",
                      color: isCurrent
                        ? "oklch(0.10 0.02 250)"
                        : isAnswered
                          ? PRIMARY
                          : "oklch(0.55 0.012 250)",
                      border: isCurrent
                        ? `1px solid ${PRIMARY}`
                        : isAnswered
                          ? "1px solid oklch(0.72 0.17 195 / 0.35)"
                          : "1px solid oklch(0.28 0.02 250)",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-1.5">
              <div
                className="flex items-center gap-2 text-xs font-body"
                style={{ color: "oklch(0.55 0.012 250)" }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: "oklch(0.72 0.17 195 / 0.2)",
                    border: "1px solid oklch(0.72 0.17 195 / 0.35)",
                  }}
                />
                Answered ({answeredCount})
              </div>
              <div
                className="flex items-center gap-2 text-xs font-body"
                style={{ color: "oklch(0.55 0.012 250)" }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: "oklch(0.22 0.02 250)",
                    border: "1px solid oklch(0.28 0.02 250)",
                  }}
                />
                Not Answered ({mockQuestions.length - answeredCount})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {phase === "results" && results && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Score Banner */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background:
                results.totalScore >= 60
                  ? "oklch(0.72 0.17 145 / 0.07)"
                  : results.totalScore >= 0
                    ? "oklch(0.72 0.17 195 / 0.06)"
                    : "oklch(0.65 0.23 25 / 0.07)",
              border:
                results.totalScore >= 60
                  ? "1px solid oklch(0.72 0.17 145 / 0.25)"
                  : results.totalScore >= 0
                    ? "1px solid oklch(0.72 0.17 195 / 0.25)"
                    : "1px solid oklch(0.65 0.23 25 / 0.25)",
            }}
          >
            <div className="text-5xl mb-3">
              {results.totalScore >= 80
                ? "🏆"
                : results.totalScore >= 40
                  ? "🎯"
                  : results.totalScore >= 0
                    ? "📚"
                    : "💪"}
            </div>
            <h2
              className="font-display font-bold text-3xl mb-1"
              style={{
                color:
                  results.totalScore >= 0 ? PRIMARY : "oklch(0.65 0.23 25)",
                letterSpacing: "-0.02em",
              }}
            >
              {results.totalScore >= 0 ? "+" : ""}
              {results.totalScore}
            </h2>
            <p
              className="font-body text-sm"
              style={{ color: "oklch(0.58 0.012 250)" }}
            >
              Total Score (max {mockQuestions.length * 4})
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <div>
                <div
                  className="font-mono font-bold text-xl"
                  style={{ color: "oklch(0.88 0.01 250)" }}
                >
                  {results.totalAttempted}/{mockQuestions.length}
                </div>
                <div
                  className="text-xs font-body"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Attempted
                </div>
              </div>
              <div>
                <div
                  className="font-mono font-bold text-xl"
                  style={{ color: "oklch(0.72 0.17 145)" }}
                >
                  {results.accuracy}%
                </div>
                <div
                  className="text-xs font-body"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Accuracy
                </div>
              </div>
              <div>
                <div
                  className="font-mono font-bold text-xl"
                  style={{ color: "oklch(0.72 0.18 60)" }}
                >
                  {mockQuestions.length - results.totalAttempted}
                </div>
                <div
                  className="text-xs font-body"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Unattempted
                </div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.16 0.018 250)",
              border: "1px solid oklch(0.26 0.02 250)",
            }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid oklch(0.24 0.02 250)" }}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3
                  className="font-display font-semibold text-sm uppercase tracking-wider"
                  style={{ color: "oklch(0.88 0.01 250)" }}
                >
                  Subject Breakdown
                </h3>
              </div>
            </div>

            <div
              className="divide-y"
              style={{ borderColor: "oklch(0.22 0.02 250)" }}
            >
              {Object.entries(results.subjects).map(([subject, stats]) => {
                const subjectColor =
                  subject === "Physics"
                    ? "oklch(0.65 0.18 240)"
                    : subject === "Chemistry"
                      ? "oklch(0.65 0.18 145)"
                      : "oklch(0.70 0.17 60)";

                const accuracy =
                  stats.attempted > 0
                    ? Math.round((stats.correct / stats.attempted) * 100)
                    : 0;

                return (
                  <div
                    key={subject}
                    className="px-5 py-4 grid grid-cols-4 gap-4 items-center"
                  >
                    <div
                      className="font-display font-semibold text-sm"
                      style={{ color: subjectColor }}
                    >
                      {subject}
                    </div>
                    <div className="text-center">
                      <div
                        className="font-mono font-bold text-base"
                        style={{ color: "oklch(0.85 0.01 250)" }}
                      >
                        {stats.correct}/{stats.attempted}
                      </div>
                      <div
                        className="text-xs font-body"
                        style={{ color: "oklch(0.45 0.012 250)" }}
                      >
                        Correct
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="font-mono font-bold text-base"
                        style={{
                          color:
                            stats.score >= 0
                              ? subjectColor
                              : "oklch(0.65 0.23 25)",
                        }}
                      >
                        {stats.score >= 0 ? "+" : ""}
                        {stats.score}
                      </div>
                      <div
                        className="text-xs font-body"
                        style={{ color: "oklch(0.45 0.012 250)" }}
                      >
                        Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="font-mono font-bold text-base"
                        style={{
                          color:
                            accuracy >= 50
                              ? "oklch(0.72 0.17 145)"
                              : "oklch(0.65 0.23 25)",
                        }}
                      >
                        {accuracy}%
                      </div>
                      <div
                        className="text-xs font-body"
                        style={{ color: "oklch(0.45 0.012 250)" }}
                      >
                        Accuracy
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Chapters */}
          {results.weakChapters.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.65 0.23 25 / 0.06)",
                border: "1px solid oklch(0.65 0.23 25 / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <XCircle
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.23 25)" }}
                />
                <h3
                  className="font-display font-semibold text-sm uppercase tracking-wider"
                  style={{ color: "oklch(0.88 0.01 250)" }}
                >
                  Weak Chapters Detected
                </h3>
                <span
                  className="text-xs font-body ml-auto"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Weakness scores updated
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.weakChapters.map(({ chapter, accuracy }) => (
                  <span
                    key={chapter}
                    className="text-xs px-2.5 py-1 rounded-full font-body"
                    style={{
                      background: "oklch(0.65 0.23 25 / 0.1)",
                      color: "oklch(0.65 0.23 25)",
                      border: "1px solid oklch(0.65 0.23 25 / 0.25)",
                    }}
                  >
                    {chapter} ({accuracy}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All chapters passed */}
          {results.weakChapters.length === 0 && results.totalAttempted > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: "oklch(0.72 0.17 145 / 0.07)",
                border: "1px solid oklch(0.72 0.17 145 / 0.2)",
              }}
            >
              <CheckCircle2
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "oklch(0.72 0.17 145)" }}
              />
              <p
                className="text-sm font-body"
                style={{ color: "oklch(0.72 0.17 145)" }}
              >
                No weak chapters detected! You scored ≥50% in all attempted
                chapters.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="font-display font-semibold h-10 px-5"
              style={{
                border: "1px solid oklch(0.72 0.17 195 / 0.35)",
                color: PRIMARY,
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              onClick={onGoToDashboard}
              className="font-display font-semibold h-10 px-5"
              style={{
                background: PRIMARY,
                color: "oklch(0.10 0.02 250)",
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
