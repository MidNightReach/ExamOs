import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Crown,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PYQQuestion } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { ProStatus } from "../hooks/useProStatus";
import {
  useGenerateSolution,
  useGetDailyPracticeCount,
  useIncrementDailyPracticeCount,
} from "../hooks/useQueries";

const PRIMARY = "oklch(0.72 0.17 195)";

// Chapter lists per subject
const CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Units & Dimensions",
    "Kinematics",
    "Laws of Motion",
    "Work Energy Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Matter",
    "Thermodynamics",
    "Kinetic Theory of Gases",
    "Oscillations",
    "Waves",
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects of Current",
    "Magnetism",
    "EMI & AC",
    "Ray Optics",
    "Wave Optics",
    "Modern Physics",
    "Semiconductor Devices",
    "Communication Systems",
    "Fluid Mechanics",
    "Thermal Properties",
    "Dual Nature of Matter",
    "Atoms & Nuclei",
    "Electric Potential",
    "Capacitors",
    "Moving Charges",
    "Alternating Current",
    "Electromagnetic Waves",
  ],
  Chemistry: [
    "Some Basic Concepts",
    "Structure of Atom",
    "Classification of Elements",
    "Chemical Bonding",
    "States of Matter",
    "Thermodynamics Chem",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Organic Chemistry Basics",
    "Hydrocarbons",
    "Environmental Chemistry",
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Principles of Extraction",
    "p-Block Advanced",
    "d and f Block",
    "Coordination Compounds",
    "Haloalkanes",
    "Haloarenes",
    "Alcohols Phenols Ethers",
    "Aldehydes Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
  ],
  Maths: [
    "Sets Relations Functions",
    "Complex Numbers",
    "Quadratic Equations",
    "Permutations Combinations",
    "Binomial Theorem",
    "Sequences Series",
    "Straight Lines",
    "Circles",
    "Conic Sections",
    "3D Geometry",
    "Limits Continuity",
    "Derivatives",
    "Applications of Derivatives",
    "Integrals",
    "Applications of Integrals",
    "Differential Equations",
    "Vectors",
    "Matrices Determinants",
    "Probability",
    "Statistics",
    "Trigonometric Functions",
    "Inverse Trigonometry",
    "Mathematical Reasoning",
    "Linear Programming",
    "Relations Functions Advanced",
    "Continuity Differentiability",
    "Definite Integrals",
    "Binomial Advanced",
    "Complex Plane",
    "Coordinate Geometry",
  ],
};

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface SessionState {
  questions: PYQQuestion[];
  currentIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  score: number;
  totalAttempted: number;
  correctCount: number;
  answeredMap: Record<string, { selected: string; correct: boolean }>;
}

interface SolutionState {
  text: string | null;
  isLoading: boolean;
  error: string | null;
}

function parseSolution(text: string): { label: string; content: string }[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const sections: { label: string; content: string }[] = [];

  const knownLabels = [
    "Step 1:",
    "Step 2:",
    "Step 3:",
    "Step 4:",
    "Step 5:",
    "Final Answer:",
    "Shortcut:",
    "Common Mistake:",
  ];

  let current: { label: string; content: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const matchedLabel = knownLabels.find((lbl) => trimmed.startsWith(lbl));

    if (matchedLabel) {
      if (current) sections.push(current);
      current = {
        label: matchedLabel.replace(":", ""),
        content: trimmed.slice(matchedLabel.length).trim(),
      };
    } else if (current) {
      current.content += (current.content ? " " : "") + trimmed;
    } else {
      sections.push({ label: "Solution", content: trimmed });
    }
  }

  if (current) sections.push(current);

  return sections.length > 0
    ? sections
    : [{ label: "Solution", content: text }];
}

function SolutionCard({ solution }: { solution: SolutionState }) {
  if (solution.isLoading) {
    return (
      <div
        className="rounded-xl p-5 flex items-center gap-3"
        style={{
          background: "oklch(0.18 0.02 195 / 0.15)",
          border: "1px solid oklch(0.72 0.17 195 / 0.2)",
        }}
      >
        <Loader2
          className="w-4 h-4 animate-spin flex-shrink-0"
          style={{ color: PRIMARY }}
        />
        <span
          className="text-sm font-body"
          style={{ color: "oklch(0.68 0.012 250)" }}
        >
          Generating AI solution...
        </span>
      </div>
    );
  }

  if (solution.error) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.62 0.22 25 / 0.08)",
          border: "1px solid oklch(0.62 0.22 25 / 0.25)",
        }}
      >
        <p className="text-sm text-destructive">{solution.error}</p>
      </div>
    );
  }

  if (!solution.text) return null;

  const sections = parseSolution(solution.text);

  const sectionColors: Record<string, string> = {
    "Final Answer": "oklch(0.72 0.17 145)",
    Shortcut: "oklch(0.72 0.18 60)",
    "Common Mistake": "oklch(0.65 0.23 25)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.15 0.02 195 / 0.12)",
        border: "1px solid oklch(0.72 0.17 195 / 0.25)",
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{
          background: "oklch(0.72 0.17 195 / 0.1)",
          borderBottom: "1px solid oklch(0.72 0.17 195 / 0.15)",
        }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        <span
          className="text-xs font-display font-semibold uppercase tracking-wider"
          style={{ color: PRIMARY }}
        >
          AI Solution
        </span>
      </div>
      <div className="p-4 space-y-3">
        {sections.map((section) => {
          const color = sectionColors[section.label] ?? "oklch(0.70 0.01 250)";
          const isHighlighted = section.label in sectionColors;
          return (
            <div
              key={`${section.label}-${section.content.slice(0, 20)}`}
              className="flex gap-3"
              style={
                isHighlighted
                  ? {
                      background: `${color.replace(")", " / 0.06)")}`,
                      border: `1px solid ${color.replace(")", " / 0.2)")}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                    }
                  : undefined
              }
            >
              <span
                className="text-xs font-display font-bold flex-shrink-0 mt-0.5"
                style={{ color, minWidth: "80px" }}
              >
                {section.label}
              </span>
              <p
                className="text-sm font-body leading-relaxed"
                style={{ color: "oklch(0.78 0.008 250)" }}
              >
                {section.content}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface PracticePageProps {
  proStatus: ProStatus;
  onUpgrade: () => void;
}

export default function PracticePage({
  proStatus,
  onUpgrade,
}: PracticePageProps) {
  const { actor } = useActor();
  const [filters, setFilters] = useState({
    subject: "All",
    chapter: "All",
    difficulty: "All",
    examType: "All",
    year: "All",
  });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [solution, setSolution] = useState<SolutionState>({
    text: null,
    isLoading: false,
    error: null,
  });
  const [showSolution, setShowSolution] = useState(false);

  const { data: practiceCountData } = useGetDailyPracticeCount();
  const incrementPracticeCount = useIncrementDailyPracticeCount();
  const generateSolution = useGenerateSolution();

  const dailyPracticeCount = Number(practiceCountData ?? 0);
  const canPractice = proStatus.isPro || dailyPracticeCount < 5;

  const availableChapters =
    filters.subject !== "All" ? (CHAPTERS[filters.subject] ?? []) : [];

  const loadQuestions = useCallback(async () => {
    if (!actor) return;

    setIsLoadingQuestions(true);
    try {
      const subject = filters.subject === "All" ? "" : filters.subject;
      const chapter = filters.chapter === "All" ? "" : filters.chapter;
      const difficulty = filters.difficulty === "All" ? "" : filters.difficulty;
      const examType = filters.examType === "All" ? "" : filters.examType;

      let questions = await actor.getQuestionsByFilter(
        subject,
        chapter,
        difficulty,
        examType,
      );

      // Filter by year client-side
      if (filters.year !== "All") {
        const yearNum = BigInt(filters.year);
        questions = questions.filter((q) => q.year === yearNum);
      }

      if (questions.length === 0) {
        toast.error(
          "No questions found for the selected filters. Try broader filters.",
        );
        setIsLoadingQuestions(false);
        return;
      }

      // Shuffle
      const shuffled = [...questions].sort(() => Math.random() - 0.5);

      setSession({
        questions: shuffled,
        currentIndex: 0,
        selectedAnswer: null,
        isAnswered: false,
        score: 0,
        totalAttempted: 0,
        correctCount: 0,
        answeredMap: {},
      });
      setSolution({ text: null, isLoading: false, error: null });
      setShowSolution(false);
      toast.success(`Loaded ${shuffled.length} questions`);
    } catch {
      toast.error("Failed to load questions. Please try again.");
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [actor, filters]);

  const handleSelectAnswer = useCallback(
    async (option: string) => {
      if (!session || session.isAnswered) return;

      // Check free tier limit
      if (!proStatus.isPro && dailyPracticeCount >= 5) {
        toast.error(
          "Daily limit reached. Upgrade to Pro for unlimited practice.",
        );
        return;
      }

      const currentQ = session.questions[session.currentIndex];
      const isCorrect = option === currentQ.correctOption;
      const scoreChange = isCorrect ? 4 : -1;

      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          selectedAnswer: option,
          isAnswered: true,
          score: prev.score + scoreChange,
          totalAttempted: prev.totalAttempted + 1,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          answeredMap: {
            ...prev.answeredMap,
            [currentQ.id]: { selected: option, correct: isCorrect },
          },
        };
      });
      setSolution({ text: null, isLoading: false, error: null });
      setShowSolution(false);

      // Increment practice count for free users
      if (!proStatus.isPro) {
        try {
          await incrementPracticeCount.mutateAsync();
        } catch {
          // non-critical
        }
      }
    },
    [session, proStatus.isPro, dailyPracticeCount, incrementPracticeCount],
  );

  const handleViewSolution = useCallback(async () => {
    if (!session) return;
    const currentQ = session.questions[session.currentIndex];

    setShowSolution(true);
    setSolution({ text: null, isLoading: true, error: null });

    try {
      const result = await generateSolution.mutateAsync({
        questionText: currentQ.questionText,
        optionA: currentQ.optionA,
        optionB: currentQ.optionB,
        optionC: currentQ.optionC,
        optionD: currentQ.optionD,
        correctOption: currentQ.correctOption,
      });
      setSolution({ text: result, isLoading: false, error: null });
    } catch {
      setSolution({
        text: null,
        isLoading: false,
        error: "Failed to generate solution. Please try again.",
      });
    }
  }, [session, generateSolution]);

  const handleNext = useCallback(() => {
    if (!session) return;
    if (session.currentIndex >= session.questions.length - 1) return;

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
      };
    });
    setSolution({ text: null, isLoading: false, error: null });
    setShowSolution(false);
  }, [session]);

  const handleReset = () => {
    setSession(null);
    setSolution({ text: null, isLoading: false, error: null });
    setShowSolution(false);
  };

  // Session complete
  const isSessionComplete =
    session !== null &&
    session.currentIndex >= session.questions.length - 1 &&
    session.isAnswered;

  const currentQuestion = session?.questions[session.currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BookOpen className="w-5 h-5" style={{ color: PRIMARY }} />
            <h1
              className="font-display font-bold text-xl"
              style={{
                color: "oklch(0.92 0.01 250)",
                letterSpacing: "-0.02em",
              }}
            >
              Practice
            </h1>
          </div>
          <p
            className="text-xs font-body"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            JEE PYQ practice with AI solutions
          </p>
        </div>

        {!proStatus.isPro && (
          <div
            className="text-right text-xs font-body px-3 py-2 rounded-lg"
            style={{
              background: "oklch(0.72 0.18 60 / 0.08)",
              border: "1px solid oklch(0.72 0.18 60 / 0.2)",
            }}
          >
            <span style={{ color: "oklch(0.55 0.012 250)" }}>Free: </span>
            <span
              className="font-display font-bold"
              style={{ color: "oklch(0.72 0.18 60)" }}
            >
              {dailyPracticeCount}/5
            </span>
            <span style={{ color: "oklch(0.55 0.012 250)" }}>
              {" "}
              questions today
            </span>
          </div>
        )}
      </div>

      {/* Free tier gate */}
      {!canPractice && (
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
            Daily Limit Reached
          </h3>
          <p
            className="font-body text-sm mb-6 max-w-xs mx-auto"
            style={{ color: "oklch(0.58 0.012 250)" }}
          >
            You've used all 5 free practice questions for today. Upgrade to Pro
            for unlimited practice.
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

      {/* Filter Panel */}
      {!session && canPractice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4 glass"
        >
          <h3
            className="font-display font-semibold text-sm uppercase tracking-wider"
            style={{ color: "oklch(0.88 0.01 250)" }}
          >
            Filter Questions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-display text-muted-foreground">
                Subject
              </Label>
              <Select
                value={filters.subject}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, subject: v, chapter: "All" }))
                }
              >
                <SelectTrigger className="h-9 text-sm font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Maths">Maths</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-display text-muted-foreground">
                Chapter
              </Label>
              <Select
                value={filters.chapter}
                onValueChange={(v) => setFilters((f) => ({ ...f, chapter: v }))}
                disabled={filters.subject === "All"}
              >
                <SelectTrigger className="h-9 text-sm font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="All">All Chapters</SelectItem>
                  {availableChapters.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-display text-muted-foreground">
                Difficulty
              </Label>
              <Select
                value={filters.difficulty}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, difficulty: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-display text-muted-foreground">
                Exam Type
              </Label>
              <Select
                value={filters.examType}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, examType: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Main">JEE Main</SelectItem>
                  <SelectItem value="Advanced">JEE Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <Label className="text-xs font-display text-muted-foreground">
                Year
              </Label>
              <Select
                value={filters.year}
                onValueChange={(v) => setFilters((f) => ({ ...f, year: v }))}
              >
                <SelectTrigger className="h-9 text-sm font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Years</SelectItem>
                  {[2024, 2023, 2022, 2021, 2020].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={loadQuestions}
            disabled={isLoadingQuestions}
            className="font-display font-semibold h-10 px-6"
            style={{
              background: PRIMARY,
              color: "oklch(0.10 0.02 250)",
            }}
          >
            {isLoadingQuestions ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <BookOpen className="w-4 h-4 mr-2" />
            )}
            {isLoadingQuestions ? "Loading..." : "Load Questions"}
          </Button>
        </motion.div>
      )}

      {/* Session Complete */}
      {isSessionComplete && session && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 text-center"
            style={{
              background: "oklch(0.72 0.17 195 / 0.06)",
              border: "1px solid oklch(0.72 0.17 195 / 0.25)",
            }}
          >
            <div className="text-4xl mb-3">
              {session.correctCount / session.totalAttempted >= 0.7
                ? "🎯"
                : session.correctCount / session.totalAttempted >= 0.4
                  ? "📚"
                  : "💪"}
            </div>
            <h3
              className="font-display font-bold text-xl mb-1"
              style={{ color: "oklch(0.92 0.01 250)" }}
            >
              Session Complete!
            </h3>
            <div className="grid grid-cols-3 gap-4 my-5">
              <div>
                <div
                  className="font-mono font-bold text-2xl"
                  style={{ color: PRIMARY }}
                >
                  {session.totalAttempted}
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
                  className="font-mono font-bold text-2xl"
                  style={{
                    color: session.score >= 0 ? PRIMARY : "oklch(0.65 0.23 25)",
                  }}
                >
                  {session.score >= 0 ? "+" : ""}
                  {session.score}
                </div>
                <div
                  className="text-xs font-body"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Score
                </div>
              </div>
              <div>
                <div
                  className="font-mono font-bold text-2xl"
                  style={{ color: "oklch(0.72 0.17 145)" }}
                >
                  {session.totalAttempted > 0
                    ? Math.round(
                        (session.correctCount / session.totalAttempted) * 100,
                      )
                    : 0}
                  %
                </div>
                <div
                  className="text-xs font-body"
                  style={{ color: "oklch(0.50 0.012 250)" }}
                >
                  Accuracy
                </div>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-display font-semibold h-9 px-5"
              style={{
                border: "1px solid oklch(0.72 0.17 195 / 0.4)",
                color: PRIMARY,
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Active Question */}
      {session && currentQuestion && !isSessionComplete && (
        <motion.div
          key={`question-${session.currentIndex}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs"
                style={{ color: "oklch(0.55 0.012 250)" }}
              >
                Q {session.currentIndex + 1} / {session.questions.length}
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
                className="text-xs px-2 py-0.5 rounded font-body"
                style={{
                  background: "oklch(0.22 0.02 250)",
                  color: "oklch(0.58 0.012 250)",
                }}
              >
                {currentQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="font-mono text-sm font-bold"
                style={{
                  color: session.score >= 0 ? PRIMARY : "oklch(0.65 0.23 25)",
                }}
              >
                Score: {session.score >= 0 ? "+" : ""}
                {session.score}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2 text-xs font-display"
                style={{ color: "oklch(0.45 0.012 250)" }}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-1 rounded-full"
            style={{ background: "oklch(0.22 0.02 250)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((session.currentIndex + (session.isAnswered ? 1 : 0)) / session.questions.length) * 100}%`,
                background: PRIMARY,
              }}
            />
          </div>

          {/* Question Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "oklch(0.16 0.018 250)",
              border: "1px solid oklch(0.26 0.02 250)",
            }}
          >
            <div className="flex items-start gap-2 mb-1">
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.1)",
                  color: PRIMARY,
                }}
              >
                {Number(currentQuestion.year)}
              </span>
              <span
                className="text-xs font-body"
                style={{ color: "oklch(0.50 0.012 250)" }}
              >
                {currentQuestion.chapter} · JEE {currentQuestion.examType}
              </span>
            </div>

            <p
              className="font-body text-base leading-relaxed mt-3 mb-5"
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
                  const isSelected = session.selectedAnswer === label;
                  const isCorrect = currentQuestion.correctOption === label;
                  const isAnswered = session.isAnswered;

                  let bg = "oklch(0.19 0.02 250)";
                  let border = "oklch(0.28 0.02 250)";
                  let textColor = "oklch(0.78 0.008 250)";

                  if (isAnswered) {
                    if (isCorrect) {
                      bg = "oklch(0.72 0.17 145 / 0.12)";
                      border = "oklch(0.72 0.17 145 / 0.4)";
                      textColor = "oklch(0.72 0.17 145)";
                    } else if (isSelected && !isCorrect) {
                      bg = "oklch(0.65 0.23 25 / 0.1)";
                      border = "oklch(0.65 0.23 25 / 0.4)";
                      textColor = "oklch(0.65 0.23 25)";
                    } else {
                      textColor = "oklch(0.45 0.012 250)";
                    }
                  } else if (isSelected) {
                    bg = "oklch(0.72 0.17 195 / 0.12)";
                    border = PRIMARY;
                    textColor = PRIMARY;
                  }

                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectAnswer(label)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        cursor: isAnswered ? "default" : "pointer",
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0 transition-all"
                        style={{
                          background:
                            isAnswered && isCorrect
                              ? "oklch(0.72 0.17 145 / 0.2)"
                              : isAnswered && isSelected && !isCorrect
                                ? "oklch(0.65 0.23 25 / 0.15)"
                                : "oklch(0.25 0.02 250)",
                          color: textColor,
                          border: `1px solid ${border}`,
                        }}
                      >
                        {isAnswered && isCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isAnswered && isSelected && !isCorrect ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          label
                        )}
                      </span>
                      <span
                        className="text-sm font-body leading-snug"
                        style={{ color: textColor }}
                      >
                        {optionText}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Post-answer panel */}
          {session.isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Feedback */}
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{
                  background:
                    session.selectedAnswer === currentQuestion.correctOption
                      ? "oklch(0.72 0.17 145 / 0.08)"
                      : "oklch(0.65 0.23 25 / 0.08)",
                  border:
                    session.selectedAnswer === currentQuestion.correctOption
                      ? "1px solid oklch(0.72 0.17 145 / 0.25)"
                      : "1px solid oklch(0.65 0.23 25 / 0.25)",
                }}
              >
                <div className="flex items-center gap-2">
                  {session.selectedAnswer === currentQuestion.correctOption ? (
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: "oklch(0.72 0.17 145)" }}
                    />
                  ) : (
                    <XCircle
                      className="w-4 h-4"
                      style={{ color: "oklch(0.65 0.23 25)" }}
                    />
                  )}
                  <span
                    className="text-sm font-display font-semibold"
                    style={{
                      color:
                        session.selectedAnswer === currentQuestion.correctOption
                          ? "oklch(0.72 0.17 145)"
                          : "oklch(0.65 0.23 25)",
                    }}
                  >
                    {session.selectedAnswer === currentQuestion.correctOption
                      ? "+4 marks"
                      : "-1 mark"}
                  </span>
                  {session.selectedAnswer !== currentQuestion.correctOption && (
                    <span
                      className="text-xs font-body"
                      style={{ color: "oklch(0.55 0.012 250)" }}
                    >
                      · Correct: Option {currentQuestion.correctOption}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!showSolution && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleViewSolution}
                      disabled={generateSolution.isPending}
                      className="h-7 px-3 text-xs font-display font-semibold"
                      style={{
                        border: "1px solid oklch(0.72 0.17 195 / 0.35)",
                        color: PRIMARY,
                        background: "transparent",
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Solution
                    </Button>
                  )}

                  {session.currentIndex < session.questions.length - 1 && (
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="h-7 px-3 text-xs font-display font-semibold"
                      style={{
                        background: PRIMARY,
                        color: "oklch(0.10 0.02 250)",
                      }}
                    >
                      Next
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Solution */}
              {showSolution && <SolutionCard solution={solution} />}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!session && canPractice && !isLoadingQuestions && (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: "oklch(0.15 0.015 250)",
            border: "1px dashed oklch(0.28 0.02 250)",
          }}
        >
          <BookOpen
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.35 0.02 250)" }}
          />
          <p
            className="text-sm font-display font-medium"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Select filters above and click "Load Questions" to start practicing
          </p>
          <p
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.38 0.012 250)" }}
          >
            JEE marking: +4 correct · −1 incorrect
          </p>
        </div>
      )}

      {/* Separator from solution */}
      {session && <Separator className="opacity-20" />}
    </motion.div>
  );
}
