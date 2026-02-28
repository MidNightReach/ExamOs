import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CheckCircle,
  Crown,
  Loader2,
  Target,
  Unlock,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { ProStatus } from "../hooks/useProStatus";
import { useTogglePro } from "../hooks/useQueries";

interface SubscriptionPageProps {
  proStatus: ProStatus;
}

const PRIMARY = "oklch(0.72 0.17 195)";
const FREE_COLOR = "oklch(0.55 0.015 250)";

const COMPARISON = [
  { feature: "Plan Generation", free: "1 per day", pro: "Unlimited" },
  { feature: "Weakness Scale", free: "Max 3", pro: "Full 1–5" },
  { feature: "Study Mode Visibility", free: "Hidden", pro: "Full view" },
  { feature: "Analytics Dashboard", free: "Locked", pro: "Full access" },
  { feature: "Mark Done Limit", free: "10/month", pro: "Unlimited" },
  { feature: "Priority Scores", free: "Hidden", pro: "Visible" },
  { feature: "Chapter Progress Over Time", free: "Locked", pro: "Available" },
  { feature: "Execution History", free: "Locked", pro: "Available" },
];

const PRO_BENEFITS = [
  { icon: Zap, text: "Unlimited plan generation every day" },
  { icon: Target, text: "Full 1–5 weakness scale for precise prioritization" },
  { icon: Unlock, text: "Full study mode visibility (Foundation → Survival)" },
  { icon: BarChart2, text: "Advanced analytics and study streak tracking" },
  { icon: CheckCircle, text: "Unlimited chapter completion tracking" },
  { icon: Crown, text: "Priority score visibility in every plan" },
];

export default function SubscriptionPage({ proStatus }: SubscriptionPageProps) {
  const togglePro = useTogglePro();

  const handleToggle = async () => {
    try {
      const result = await togglePro.mutateAsync();
      if (result.isPro) {
        toast.success("🎉 Upgraded to Pro! All features unlocked.");
      } else {
        toast.success("Switched back to Free tier.");
      }
    } catch {
      toast.error("Failed to update subscription. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Crown className="w-5 h-5" style={{ color: PRIMARY }} />
          <h1
            className="font-display font-bold text-xl"
            style={{ color: "oklch(0.92 0.01 250)", letterSpacing: "-0.02em" }}
          >
            Subscription
          </h1>
        </div>
        <p
          className="text-xs font-body"
          style={{ color: "oklch(0.50 0.012 250)" }}
        >
          Manage your Examos plan
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-6"
        style={{
          background: proStatus.isPro
            ? "oklch(0.72 0.17 195 / 0.07)"
            : "oklch(0.16 0.018 250)",
          border: proStatus.isPro
            ? "1px solid oklch(0.72 0.17 195 / 0.3)"
            : "1px solid oklch(0.24 0.02 250)",
          boxShadow: proStatus.isPro
            ? "0 0 30px oklch(0.72 0.17 195 / 0.08)"
            : "none",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {proStatus.isPro ? (
                <Crown className="w-5 h-5" style={{ color: PRIMARY }} />
              ) : (
                <Zap
                  className="w-5 h-5"
                  style={{ color: "oklch(0.55 0.015 250)" }}
                />
              )}
              <h2
                className="font-display font-bold text-2xl"
                style={{
                  color: proStatus.isPro ? PRIMARY : "oklch(0.75 0.01 250)",
                }}
              >
                {proStatus.isPro ? "Pro" : "Free"}
              </h2>
            </div>
            <p
              className="text-sm font-body"
              style={{ color: "oklch(0.55 0.012 250)" }}
            >
              {proStatus.isPro
                ? "All features unlocked. Enjoy the full engine."
                : "Limited plan generation and feature access."}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            {proStatus.isPro ? (
              <div>
                <p
                  className="text-xs font-display font-semibold"
                  style={{ color: PRIMARY }}
                >
                  Active
                </p>
                <p
                  className="text-xs font-body mt-0.5"
                  style={{ color: "oklch(0.42 0.012 250)" }}
                >
                  Demo mode
                </p>
              </div>
            ) : (
              <div>
                <p
                  className="text-xs font-display font-semibold"
                  style={{ color: "oklch(0.45 0.012 250)" }}
                >
                  Free Tier
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <div
          className="mt-5 pt-4"
          style={{ borderTop: "1px solid oklch(0.24 0.02 250 / 0.5)" }}
        >
          <Button
            onClick={handleToggle}
            disabled={togglePro.isPending}
            className="font-display font-bold h-11 px-8"
            style={
              proStatus.isPro
                ? {
                    background: "oklch(0.22 0.02 250)",
                    color: "oklch(0.58 0.012 250)",
                    border: "1px solid oklch(0.28 0.02 250)",
                  }
                : {
                    background: PRIMARY,
                    color: "oklch(0.10 0.02 250)",
                    boxShadow: "0 0 20px oklch(0.72 0.17 195 / 0.25)",
                  }
            }
          >
            {togglePro.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : proStatus.isPro ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Switch to Free
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>

          <p
            className="text-xs font-body mt-3"
            style={{ color: "oklch(0.38 0.012 250)" }}
          >
            Demo mode — no payment required. Toggle to test Pro features.
          </p>
        </div>
      </motion.div>

      {/* Pro Benefits */}
      {!proStatus.isPro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 glass"
        >
          <h3
            className="font-display font-semibold text-sm uppercase tracking-wider mb-4"
            style={{ color: "oklch(0.88 0.01 250)" }}
          >
            What you get with Pro
          </h3>
          <div className="space-y-3">
            {PRO_BENEFITS.map((benefit) => (
              <div key={benefit.text} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "oklch(0.72 0.17 195 / 0.12)",
                    border: "1px solid oklch(0.72 0.17 195 / 0.25)",
                  }}
                >
                  <benefit.icon
                    className="w-3 h-3"
                    style={{ color: PRIMARY }}
                  />
                </div>
                <p
                  className="text-sm font-body leading-relaxed"
                  style={{ color: "oklch(0.68 0.012 250)" }}
                >
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.24 0.02 250)",
          background: "oklch(0.15 0.018 250)",
        }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-3 py-4 px-5"
          style={{ borderBottom: "1px solid oklch(0.24 0.02 250)" }}
        >
          <div
            className="font-display font-semibold text-xs uppercase tracking-wider"
            style={{ color: "oklch(0.45 0.012 250)" }}
          >
            Feature
          </div>
          <div className="text-center">
            <span
              className="font-display font-semibold text-sm"
              style={{ color: FREE_COLOR }}
            >
              Free
            </span>
          </div>
          <div className="text-center">
            <span
              className="inline-flex items-center gap-1 font-display font-semibold text-sm px-2.5 py-1 rounded-full"
              style={{
                background: "oklch(0.72 0.17 195 / 0.12)",
                color: PRIMARY,
                border: "1px solid oklch(0.72 0.17 195 / 0.25)",
              }}
            >
              <Crown className="w-3 h-3" />
              Pro
            </span>
          </div>
        </div>

        {COMPARISON.map((row, i) => (
          <div
            key={row.feature}
            className="grid grid-cols-3 py-3.5 px-5 items-center"
            style={{
              borderBottom:
                i < COMPARISON.length - 1
                  ? "1px solid oklch(0.20 0.02 250 / 0.5)"
                  : undefined,
              background:
                i % 2 === 0 ? "oklch(0.17 0.018 250 / 0.5)" : "transparent",
            }}
          >
            <span
              className="font-body text-xs"
              style={{ color: "oklch(0.70 0.01 250)" }}
            >
              {row.feature}
            </span>
            <div className="text-center">
              <span className="font-mono text-xs" style={{ color: FREE_COLOR }}>
                {row.free === "Locked" || row.free === "Hidden" ? (
                  <XCircle
                    className="w-3.5 h-3.5 inline"
                    style={{ color: "oklch(0.62 0.22 25 / 0.6)" }}
                  />
                ) : (
                  row.free
                )}
              </span>
            </div>
            <div className="text-center">
              {row.pro === "Unlimited" ||
              row.pro === "Full view" ||
              row.pro === "Full access" ||
              row.pro === "Available" ||
              row.pro === "Visible" ? (
                <CheckCircle
                  className="w-3.5 h-3.5 inline"
                  style={{ color: PRIMARY }}
                />
              ) : (
                <span className="font-mono text-xs" style={{ color: PRIMARY }}>
                  {row.pro}
                </span>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
