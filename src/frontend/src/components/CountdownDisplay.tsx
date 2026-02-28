import { AlertTriangle, Clock, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import {
  type StudyMode,
  getDaysLeft,
  getExamDate,
  getMode,
  getModeColorClass,
} from "../utils/planEngine";

interface CountdownDisplayProps {
  profile: UserProfile | null;
  proStatus?: ProStatus;
  onUpgrade?: () => void;
}

const modeDescriptions: Record<StudyMode, string> = {
  Foundation: "Build deep understanding. Focus on concepts and fundamentals.",
  Build: "Strengthen weak areas. Increase practice intensity.",
  Intensive: "Targeted revision. Mock tests and problem sets.",
  Survival: "High-priority topics only. Maximize every hour.",
};

const modeEmoji: Record<StudyMode, string> = {
  Foundation: "🌱",
  Build: "🔨",
  Intensive: "⚡",
  Survival: "🔥",
};

const PRIMARY = "oklch(0.72 0.17 195)";

export default function CountdownDisplay({
  profile,
  proStatus,
  onUpgrade,
}: CountdownDisplayProps) {
  const canSeeMode = proStatus?.canSeeMode ?? true; // default true for backward compat

  if (!profile) {
    return (
      <div className="rounded-xl p-6 glass flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-display font-medium text-muted-foreground">
            Set up your exam details above to see the countdown.
          </p>
        </div>
      </div>
    );
  }

  const examDate = getExamDate(
    profile.examType,
    profile.examMonth,
    profile.examYear,
  );
  const daysLeft = getDaysLeft(examDate);

  if (daysLeft === null) {
    return (
      <div className="rounded-xl p-6 glass flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Invalid exam date.</p>
      </div>
    );
  }

  const isPast = daysLeft < 0;
  const mode = isPast ? "Survival" : getMode(daysLeft);
  const colorClass = getModeColorClass(mode);

  const examLabel =
    profile.examType === "Main"
      ? `JEE Main ${profile.examMonth}`
      : "JEE Advanced";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl p-6 glass"
    >
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
        <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">
          Countdown
        </h2>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <motion.div
            key={daysLeft}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="font-mono font-bold leading-none"
            style={{
              fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
              color: "oklch(0.94 0.01 250)",
              letterSpacing: "-0.02em",
            }}
          >
            {isPast ? "0" : daysLeft}
          </motion.div>
          <p className="font-body text-sm text-muted-foreground mt-1">
            days until <span style={{ color: PRIMARY }}>{examLabel}</span>
          </p>
        </div>

        <div className="text-right">
          {canSeeMode ? (
            <>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-display font-semibold ${colorClass}`}
              >
                <span>{modeEmoji[mode]}</span>
                <span>{mode}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-[180px] text-right leading-relaxed">
                {modeDescriptions[mode]}
              </p>
            </>
          ) : (
            <div className="text-right">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-display font-medium"
                style={{
                  background: "oklch(0.20 0.02 250)",
                  borderColor: "oklch(0.28 0.02 250)",
                  color: "oklch(0.45 0.012 250)",
                }}
              >
                <Lock className="w-3 h-3" />
                <span>Mode hidden</span>
              </div>
              <button
                type="button"
                onClick={onUpgrade}
                className="block mt-2 text-xs font-display font-medium"
                style={{ color: PRIMARY }}
              >
                Upgrade to see mode →
              </button>
            </div>
          )}
        </div>
      </div>

      {!isPast && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress to exam</span>
            <span className="font-mono">
              {examDate
                ? `${examDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : ""}
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(2, Math.min(100, 100 - (daysLeft / 365) * 100))}%`,
              }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${colorClass.split(" ")[0]}`}
              style={{ background: PRIMARY }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
