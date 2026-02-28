import { Button } from "@/components/ui/button";
import { BarChart2, Crown, Flame, Lock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { UserChapter } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import { useGetProfile, useGetStreak } from "../hooks/useQueries";
import { getDaysLeft, getExamDate, getMode } from "../utils/planEngine";

interface AnalyticsPageProps {
  chapters: UserChapter[];
  proStatus: ProStatus;
  onUpgrade: () => void;
}

const PRIMARY = "oklch(0.72 0.17 195)";
const SUBJECT_COLORS: Record<string, string> = {
  Physics: "oklch(0.65 0.18 240)",
  Chemistry: "oklch(0.65 0.18 145)",
  Maths: "oklch(0.70 0.17 60)",
};

function AnalyticsContent({ chapters }: { chapters: UserChapter[] }) {
  const { data: streak } = useGetStreak();
  const { data: profile } = useGetProfile();

  const stats = useMemo(() => {
    const subjects = ["Physics", "Chemistry", "Maths"];
    const total = chapters.filter((ch) => Number(ch.timesStudied) > 0).length;

    const subjectStats = subjects.map((subj) => {
      const chs = chapters.filter((ch) => ch.subject === subj);
      const studied = chs.filter((ch) => Number(ch.timesStudied) > 0).length;
      const totalStudied = chs.reduce(
        (sum, ch) => sum + Number(ch.timesStudied),
        0,
      );
      const avgWeakness =
        chs.length > 0
          ? chs.reduce((sum, ch) => sum + Number(ch.weakness), 0) / chs.length
          : 0;
      return {
        name: subj,
        studied,
        totalStudied,
        avgWeakness,
        total: chs.length,
      };
    });

    const maxStudied = Math.max(...subjectStats.map((s) => s.totalStudied), 1);
    const weakestSubject = [...subjectStats].sort(
      (a, b) => b.avgWeakness - a.avgWeakness,
    )[0];
    const mostStudied = [...subjectStats].sort(
      (a, b) => b.totalStudied - a.totalStudied,
    )[0];

    return { total, subjectStats, maxStudied, weakestSubject, mostStudied };
  }, [chapters]);

  const currentStreak = Number(streak?.currentStreak ?? 0);

  const examDate = profile
    ? getExamDate(profile.examType, profile.examMonth, profile.examYear)
    : null;
  const daysLeft = getDaysLeft(examDate);
  const currentMode =
    daysLeft !== null && daysLeft > 0 ? getMode(daysLeft) : "Survival";

  const modeColors: Record<string, string> = {
    Foundation: "oklch(0.72 0.12 195)",
    Build: "oklch(0.72 0.17 145)",
    Intensive: "oklch(0.72 0.18 60)",
    Survival: "oklch(0.65 0.23 25)",
  };
  const modeEmoji: Record<string, string> = {
    Foundation: "🌱",
    Build: "🔨",
    Intensive: "⚡",
    Survival: "🔥",
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-4 glass"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
            style={{
              background: "oklch(0.72 0.17 195 / 0.12)",
              border: "1px solid oklch(0.72 0.17 195 / 0.25)",
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
          </div>
          <div
            className="font-mono font-bold text-2xl leading-none"
            style={{ color: "oklch(0.90 0.01 250)" }}
          >
            {stats.total}
          </div>
          <div
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Chapters Studied
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4 glass"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
            style={{
              background: "oklch(0.65 0.23 25 / 0.12)",
              border: "1px solid oklch(0.65 0.23 25 / 0.25)",
            }}
          >
            <Flame
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.65 0.23 25)" }}
            />
          </div>
          <div
            className="font-mono font-bold text-2xl leading-none"
            style={{ color: "oklch(0.90 0.01 250)" }}
          >
            {currentStreak}
          </div>
          <div
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Day Streak
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-4 glass"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
            style={{
              background: `${SUBJECT_COLORS[stats.weakestSubject?.name ?? "Physics"].slice(0, -1)} / 0.12)`,
              border: `1px solid ${SUBJECT_COLORS[stats.weakestSubject?.name ?? "Physics"].slice(0, -1)} / 0.25)`,
            }}
          >
            <span className="text-sm">⚠️</span>
          </div>
          <div
            className="font-display font-bold text-lg leading-none truncate"
            style={{ color: "oklch(0.90 0.01 250)" }}
          >
            {stats.weakestSubject?.name ?? "—"}
          </div>
          <div
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Weakest Subject
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4 glass"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
            style={{
              background: `${SUBJECT_COLORS[stats.mostStudied?.name ?? "Maths"].slice(0, -1)} / 0.12)`,
              border: `1px solid ${SUBJECT_COLORS[stats.mostStudied?.name ?? "Maths"].slice(0, -1)} / 0.25)`,
            }}
          >
            <span className="text-sm">🏆</span>
          </div>
          <div
            className="font-display font-bold text-lg leading-none truncate"
            style={{ color: "oklch(0.90 0.01 250)" }}
          >
            {stats.mostStudied?.name ?? "—"}
          </div>
          <div
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Most Studied
          </div>
        </motion.div>
      </div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl glass p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
          <h3
            className="font-display font-semibold text-sm uppercase tracking-wider"
            style={{ color: "oklch(0.88 0.01 250)" }}
          >
            Chapters Completed by Subject
          </h3>
        </div>

        <div className="space-y-4">
          {stats.subjectStats.map((subj) => {
            const pct =
              stats.maxStudied > 0
                ? (subj.totalStudied / stats.maxStudied) * 100
                : 0;
            const color = SUBJECT_COLORS[subj.name] ?? PRIMARY;
            return (
              <div key={subj.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-display font-medium text-sm"
                    style={{ color: color }}
                  >
                    {subj.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-xs"
                      style={{ color: "oklch(0.55 0.012 250)" }}
                    >
                      {subj.studied}/{subj.total} chapters
                    </span>
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: color }}
                    >
                      {subj.totalStudied}× total
                    </span>
                  </div>
                </div>
                <div
                  className="h-2.5 rounded-full"
                  style={{ background: "oklch(0.22 0.02 250)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Mode Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl glass p-5"
      >
        <h3
          className="font-display font-semibold text-sm uppercase tracking-wider mb-4"
          style={{ color: "oklch(0.88 0.01 250)" }}
        >
          Current Study Mode
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{modeEmoji[currentMode]}</span>
          <div>
            <p
              className="font-display font-bold text-base"
              style={{ color: modeColors[currentMode] }}
            >
              {currentMode} Mode
            </p>
            <p
              className="text-xs font-body"
              style={{ color: "oklch(0.52 0.012 250)" }}
            >
              {daysLeft !== null
                ? `${Math.max(0, daysLeft)} days until exam`
                : "Set exam details to see mode"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Study History placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl glass p-5"
      >
        <h3
          className="font-display font-semibold text-sm uppercase tracking-wider mb-3"
          style={{ color: "oklch(0.88 0.01 250)" }}
        >
          Chapter Progress Over Time
        </h3>
        <div
          className="rounded-lg p-6 text-center"
          style={{
            background: "oklch(0.18 0.018 250)",
            border: "1px dashed oklch(0.28 0.02 250)",
          }}
        >
          <BarChart2
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: "oklch(0.35 0.02 250)" }}
          />
          <p
            className="text-sm font-display font-medium"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Historical charts coming soon
          </p>
          <p
            className="text-xs font-body mt-1"
            style={{ color: "oklch(0.38 0.012 250)" }}
          >
            Track progress trends across weeks and months
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AnalyticsPage({
  chapters,
  proStatus,
  onUpgrade,
}: AnalyticsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart2 className="w-5 h-5" style={{ color: PRIMARY }} />
            <h1
              className="font-display font-bold text-xl"
              style={{
                color: "oklch(0.92 0.01 250)",
                letterSpacing: "-0.02em",
              }}
            >
              Analytics
            </h1>
            {proStatus.isPro && (
              <span
                className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.12)",
                  color: PRIMARY,
                  border: "1px solid oklch(0.72 0.17 195 / 0.25)",
                }}
              >
                PRO
              </span>
            )}
          </div>
          <p
            className="text-xs font-body"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            Your study insights and performance breakdown
          </p>
        </div>
      </div>

      {/* Content with blur gate for free users */}
      <div className="relative">
        {/* Always render content (for blur effect to work) */}
        <div
          style={{
            filter: proStatus.isPro ? "none" : "blur(4px)",
            pointerEvents: proStatus.isPro ? "auto" : "none",
            userSelect: proStatus.isPro ? "auto" : "none",
          }}
        >
          <AnalyticsContent chapters={chapters} />
        </div>

        {/* Overlay for free users */}
        {!proStatus.isPro && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ zIndex: 10 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center rounded-2xl p-8 mx-4"
              style={{
                background: "oklch(0.15 0.018 250 / 0.95)",
                border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                boxShadow: "0 0 40px oklch(0.72 0.17 195 / 0.1)",
                backdropFilter: "blur(8px)",
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
                Analytics is Pro
              </h3>
              <p
                className="font-body text-sm mb-6 max-w-xs mx-auto"
                style={{ color: "oklch(0.58 0.012 250)" }}
              >
                Unlock study insights, streak analytics, subject breakdowns, and
                performance trends.
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
          </div>
        )}
      </div>
    </motion.div>
  );
}
