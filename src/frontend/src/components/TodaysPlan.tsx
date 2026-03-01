import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  Lock,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { UserChapter } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import {
  useIncrementDailyPlanCount,
  useMarkChapterDone,
} from "../hooks/useQueries";
import {
  type PlanItem,
  generatePlan,
  getSubjectBadgeClass,
} from "../utils/planEngine";

interface TodaysPlanProps {
  chapters: UserChapter[];
  daysLeft: number | null;
  initialHours: number;
  onHoursChange: (hours: number) => void;
  onChapterDone: (chapterName: string) => void;
  proStatus?: ProStatus;
}

const PRIMARY = "oklch(0.72 0.17 195)";

export default function TodaysPlan({
  chapters,
  daysLeft,
  initialHours,
  onHoursChange,
  onChapterDone,
  proStatus,
}: TodaysPlanProps) {
  const [dailyHours, setDailyHours] = useState<number>(initialHours || 6);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [doneChapters, setDoneChapters] = useState<Set<string>>(new Set());
  const markChapterDone = useMarkChapterDone();
  const incrementDailyPlanCount = useIncrementDailyPlanCount();

  const canGeneratePlan = proStatus?.canGeneratePlan ?? true;
  const canMarkDone = proStatus?.canMarkDone ?? true;
  const canSeePriority = proStatus?.canSeePriority ?? false;
  const isPro = proStatus?.isPro ?? false;
  const dailyPlanCount = proStatus?.dailyPlanCount ?? 0;

  const handleGeneratePlan = useCallback(async () => {
    if (!canGeneratePlan) {
      toast.error(
        "Daily plan limit reached. Upgrade to Pro for unlimited plans.",
      );
      return;
    }
    if (!daysLeft && daysLeft !== 0) {
      toast.error("Set your exam details first to generate a plan.");
      return;
    }
    if (chapters.length === 0) {
      toast.error("No chapters loaded yet.");
      return;
    }
    const effectiveDays = Math.max(1, daysLeft);
    const generated = generatePlan(chapters, dailyHours, effectiveDays);
    setPlan(generated);
    setPlanGenerated(true);
    setDoneChapters(new Set());
    toast.success(`Plan generated — ${generated.length} chapters selected`);

    // Track plan generation count for free users
    if (!isPro) {
      try {
        await incrementDailyPlanCount.mutateAsync();
      } catch {
        // Non-critical
      }
    }
  }, [
    chapters,
    dailyHours,
    daysLeft,
    canGeneratePlan,
    isPro,
    incrementDailyPlanCount,
  ]);

  const handleMarkDone = async (chapterName: string) => {
    setDoneChapters((prev) => new Set([...prev, chapterName]));
    onChapterDone(chapterName);

    try {
      await markChapterDone.mutateAsync({ chapterName });
    } catch {
      setDoneChapters((prev) => {
        const next = new Set(prev);
        next.delete(chapterName);
        return next;
      });
      toast.error("Failed to mark as done. Please try again.");
    }
  };

  const totalHours = plan.reduce((sum, item) => sum + item.allocatedHours, 0);
  const completedCount = doneChapters.size;
  const progressPct =
    plan.length > 0 ? (completedCount / plan.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl glass overflow-hidden"
      style={{
        border: planGenerated
          ? "1px solid oklch(0.72 0.17 195 / 0.2)"
          : undefined,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4" style={{ color: PRIMARY }} />
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">
            Today's Plan
          </h2>
          {planGenerated && plan.length > 0 && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {completedCount}/{plan.length} done
            </span>
          )}
        </div>

        {/* Free tier notice */}
        {!isPro && (
          <div
            className="mb-4 rounded-lg px-3 py-2 flex items-center gap-2"
            style={{
              background: "oklch(0.18 0.02 250)",
              border: "1px solid oklch(0.26 0.02 250)",
            }}
          >
            <span
              className="text-xs font-body"
              style={{ color: "oklch(0.52 0.012 250)" }}
            >
              Free tier:{" "}
              <span
                className="font-display font-semibold"
                style={{ color: "oklch(0.72 0.17 60)" }}
              >
                {dailyPlanCount}/1
              </span>{" "}
              plans today
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Daily study hours
            </Label>
            <Input
              type="number"
              value={dailyHours}
              onChange={(e) => {
                const val = Math.max(1, Math.min(16, Number(e.target.value)));
                setDailyHours(val);
                onHoursChange(val);
              }}
              min={1}
              max={16}
              className="font-mono h-9 bg-secondary/50 border-border w-24"
            />
          </div>

          {canGeneratePlan ? (
            <Button
              onClick={handleGeneratePlan}
              className="font-display font-semibold text-sm h-9 px-5"
              style={{
                background: PRIMARY,
                color: "oklch(0.10 0.02 250)",
              }}
            >
              Generate Plan
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button
                disabled
                className="font-display font-semibold text-sm h-9 px-5 opacity-50 cursor-not-allowed"
                style={{
                  background: "oklch(0.28 0.02 250)",
                  color: "oklch(0.50 0.012 250)",
                }}
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Generate Plan
              </Button>
              <span
                className="text-[10px] font-display"
                style={{ color: PRIMARY }}
              >
                Upgrade for unlimited
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {planGenerated && plan.length > 0 && (
          <div className="mt-4">
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: PRIMARY }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>{totalHours.toFixed(1)}h planned</span>
              <span>
                {completedCount === plan.length && plan.length > 0
                  ? "🎉 All done!"
                  : `${Math.round(progressPct)}% complete`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Plan List */}
      <div className="px-6 pb-6">
        {!planGenerated ? (
          <div className="py-10 text-center">
            <BookOpen
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.02 250)" }}
            />
            <p className="text-sm text-muted-foreground">
              Set your daily hours and hit{" "}
              <span style={{ color: PRIMARY }}>Generate Plan</span> to see
              today's chapters.
            </p>
          </div>
        ) : plan.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No chapters matched the criteria. Try increasing daily hours.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {plan.map((item, index) => {
                const isDone = doneChapters.has(item.chapterName);
                const isLoading =
                  markChapterDone.isPending &&
                  markChapterDone.variables?.chapterName === item.chapterName;
                const badgeClass = getSubjectBadgeClass(item.subject);

                return (
                  <motion.div
                    key={item.chapterName}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: isDone ? 0.45 : 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all"
                    style={{
                      background: isDone
                        ? "oklch(0.22 0.02 250 / 0.3)"
                        : "oklch(0.20 0.02 250 / 0.5)",
                      border: isDone
                        ? "1px solid oklch(0.28 0.02 250 / 0.3)"
                        : "1px solid oklch(0.28 0.02 250 / 0.6)",
                    }}
                  >
                    {/* Index */}
                    <span className="font-mono text-xs text-muted-foreground w-5 text-center flex-shrink-0">
                      {isDone ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-body font-medium truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {item.chapterName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-display font-medium ${badgeClass}`}
                        >
                          {item.subject}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.allocatedHours.toFixed(1)}h
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Number(item.timesStudied)}× studied
                        </span>
                        {/* Priority score */}
                        {canSeePriority ? (
                          <span
                            className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{
                              background: "oklch(0.72 0.17 195 / 0.1)",
                              color: PRIMARY,
                            }}
                          >
                            P:{item.priority.toFixed(0)}
                          </span>
                        ) : (
                          <span
                            className="text-xs flex items-center gap-1"
                            style={{ color: "oklch(0.38 0.012 250)" }}
                          >
                            <Lock className="w-3 h-3" />
                            <span>priority</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mark Done */}
                    {!isDone ? (
                      canMarkDone ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkDone(item.chapterName)}
                          disabled={isLoading}
                          className="text-xs h-7 px-3 font-display font-medium flex-shrink-0"
                          style={{
                            border: "1px solid oklch(0.72 0.17 195 / 0.4)",
                            color: PRIMARY,
                            background: "transparent",
                          }}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Done"
                          )}
                        </Button>
                      ) : (
                        <div
                          className="text-[10px] font-display font-semibold flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded"
                          style={{
                            background: "oklch(0.72 0.17 195 / 0.1)",
                            color: PRIMARY,
                          }}
                        >
                          <Crown className="w-3 h-3" />
                          Pro
                        </div>
                      )
                    ) : (
                      <CheckCircle2
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: PRIMARY }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
