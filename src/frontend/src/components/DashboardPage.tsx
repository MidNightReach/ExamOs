import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Flame, Lock, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { UserChapter, UserProfile } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import { useGetStreak } from "../hooks/useQueries";
import { getMode } from "../utils/planEngine";
import CountdownDisplay from "./CountdownDisplay";
import ExamSetup from "./ExamSetup";
import type { SectionId } from "./Sidebar";

interface DashboardPageProps {
  profile: UserProfile | null;
  chapters: UserChapter[];
  daysLeft: number | null;
  profileLoading: boolean;
  proStatus: ProStatus;
  onProfileSaved: () => void;
  onNavigate: (section: SectionId) => void;
}

const PRIMARY = "oklch(0.72 0.17 195)";

export default function DashboardPage({
  profile,
  chapters,
  daysLeft,
  profileLoading,
  proStatus,
  onProfileSaved,
  onNavigate,
}: DashboardPageProps) {
  const { data: streak } = useGetStreak();

  const totalStudied = chapters.filter(
    (ch) => Number(ch.timesStudied) > 0,
  ).length;

  const currentStreak = Number(streak?.currentStreak ?? 0);

  const modeForDisplay =
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

  if (profileLoading) {
    return (
      <div className="space-y-5 max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="col-span-2 h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 max-w-5xl"
    >
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display font-bold text-xl"
            style={{ color: "oklch(0.92 0.01 250)", letterSpacing: "-0.02em" }}
          >
            Dashboard
          </h1>
          <p
            className="text-xs font-body mt-0.5"
            style={{ color: "oklch(0.50 0.012 250)" }}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Streak badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background:
              currentStreak > 0
                ? "oklch(0.65 0.23 25 / 0.12)"
                : "oklch(0.20 0.02 250)",
            border:
              currentStreak > 0
                ? "1px solid oklch(0.65 0.23 25 / 0.3)"
                : "1px solid oklch(0.26 0.02 250)",
          }}
        >
          <Flame
            className="w-5 h-5"
            style={{
              color:
                currentStreak > 0
                  ? "oklch(0.65 0.23 25)"
                  : "oklch(0.40 0.012 250)",
            }}
          />
          <div>
            <span
              className="font-mono font-bold text-lg leading-none block"
              style={{
                color:
                  currentStreak > 0
                    ? "oklch(0.65 0.23 25)"
                    : "oklch(0.55 0.012 250)",
              }}
            >
              {currentStreak}
            </span>
            <span
              className="text-[10px] font-display"
              style={{ color: "oklch(0.45 0.012 250)" }}
            >
              day streak
            </span>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: TrendingUp,
            value: totalStudied,
            label: "Chapters Studied",
            color: PRIMARY,
          },
          {
            icon: CalendarDays,
            value: daysLeft !== null ? Math.max(0, daysLeft) : "—",
            label: "Days to Exam",
            color: "oklch(0.70 0.17 60)",
          },
          {
            icon: Flame,
            value: currentStreak,
            label: "Study Streak",
            color: "oklch(0.65 0.23 25)",
          },
          {
            icon: Zap,
            value: chapters.length,
            label: "Total Chapters",
            color: "oklch(0.65 0.18 240)",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="rounded-xl p-4 glass"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
              style={{
                background: `${stat.color.slice(0, -1)} / 0.12)`,
                border: `1px solid ${stat.color.slice(0, -1)} / 0.25)`,
              }}
            >
              <stat.icon
                className="w-3.5 h-3.5"
                style={{ color: stat.color }}
              />
            </div>
            <div
              className="font-mono font-bold text-2xl leading-none"
              style={{ color: "oklch(0.90 0.01 250)" }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs font-body mt-1"
              style={{ color: "oklch(0.50 0.012 250)" }}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current Mode Card (only shown if profile & proStatus) */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: proStatus.canSeeMode
              ? `${modeColors[modeForDisplay].slice(0, -1)} / 0.08)`
              : "oklch(0.16 0.018 250)",
            border: `1px solid ${
              proStatus.canSeeMode
                ? `${modeColors[modeForDisplay].slice(0, -1)} / 0.25)`
                : "oklch(0.24 0.02 250)"
            }`,
          }}
        >
          {proStatus.canSeeMode ? (
            <>
              <span className="text-2xl">{modeEmoji[modeForDisplay]}</span>
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: modeColors[modeForDisplay] }}
                >
                  {modeForDisplay} Mode
                </p>
                <p
                  className="text-xs font-body mt-0.5"
                  style={{ color: "oklch(0.55 0.012 250)" }}
                >
                  {daysLeft !== null && daysLeft > 0
                    ? `${daysLeft} days remaining`
                    : "Exam is today or past"}
                </p>
              </div>
            </>
          ) : (
            <>
              <Lock
                className="w-4 h-4"
                style={{ color: "oklch(0.45 0.012 250)" }}
              />
              <div className="flex-1">
                <p
                  className="font-display font-medium text-sm"
                  style={{ color: "oklch(0.58 0.012 250)" }}
                >
                  Study Mode hidden
                </p>
                <p
                  className="text-xs font-body mt-0.5"
                  style={{ color: "oklch(0.42 0.012 250)" }}
                >
                  {daysLeft !== null
                    ? `${daysLeft} days remaining`
                    : "Set exam details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("subscription")}
                className="text-xs font-display font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.12)",
                  color: PRIMARY,
                  border: "1px solid oklch(0.72 0.17 195 / 0.25)",
                }}
              >
                Upgrade
              </button>
            </>
          )}
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Exam Setup + Countdown */}
        <div className="space-y-4">
          <ExamSetup profile={profile} onSaved={onProfileSaved} />
          <CountdownDisplay
            profile={profile}
            proStatus={proStatus}
            onUpgrade={() => onNavigate("subscription")}
          />
        </div>

        {/* Right: Quick links */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {[
            {
              section: "plan" as SectionId,
              icon: "📋",
              title: "Today's Plan",
              desc: "Generate and execute your daily study plan",
              color: PRIMARY,
            },
            {
              section: "weakness" as SectionId,
              icon: "🎯",
              title: "Weakness Panel",
              desc: "Rate and adjust your chapter difficulty",
              color: "oklch(0.65 0.18 145)",
            },
            {
              section: "materials" as SectionId,
              icon: "📚",
              title: "JEE Materials",
              desc: "Formulas, reactions, and key concepts",
              color: "oklch(0.70 0.17 60)",
            },
            {
              section: "analytics" as SectionId,
              icon: "📊",
              title: "Analytics",
              desc: proStatus.isPro
                ? "View your study insights"
                : "Pro — study insights & trends",
              color: "oklch(0.65 0.18 240)",
              locked: !proStatus.isPro,
            },
          ].map((card, i) => (
            <motion.button
              key={card.section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              type="button"
              onClick={() => onNavigate(card.section)}
              className="relative text-left rounded-xl p-5 transition-all duration-200 group"
              style={{
                background: "oklch(0.16 0.018 250 / 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid oklch(0.28 0.02 250 / 0.6)",
                ...(card.locked ? { opacity: 0.7 } : {}),
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "oklch(0.18 0.022 250 / 0.9)";
                el.style.borderColor = `${card.color.slice(0, -1)} / 0.5)`;
                el.style.boxShadow = `0 4px 20px ${card.color.slice(0, -1)} / 0.12)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "oklch(0.16 0.018 250 / 0.85)";
                el.style.borderColor = "oklch(0.28 0.02 250 / 0.6)";
                el.style.boxShadow = "";
              }}
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-display font-semibold text-sm"
                  style={{ color: "oklch(0.88 0.01 250)" }}
                >
                  {card.title}
                </h3>
                {card.locked && (
                  <Lock className="w-3 h-3" style={{ color: PRIMARY }} />
                )}
              </div>
              <p
                className="text-xs font-body leading-relaxed"
                style={{ color: "oklch(0.52 0.012 250)" }}
              >
                {card.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
