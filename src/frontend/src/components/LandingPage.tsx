import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart2,
  Brain,
  CheckCircle,
  Clock,
  Crown,
  Loader2,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LandingPageProps {
  onLoginSuccess?: () => void;
}

const FREE_COLOR = "oklch(0.55 0.015 250)";
const PRO_COLOR = "oklch(0.72 0.17 195)";
const PRIMARY = "oklch(0.72 0.17 195)";

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showLogin, setShowLogin] = useState(false);
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    setShowLogin(true);
    try {
      await login();
      queryClient.clear();
      onLoginSuccess?.();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === "User is already authenticated") {
        await login();
      }
    }
  };

  const steps = [
    {
      icon: Target,
      number: "01",
      title: "Rate Your Weaknesses",
      desc: "Score each chapter 1–5 based on your confidence. Takes 3 minutes.",
    },
    {
      icon: Brain,
      number: "02",
      title: "Engine Builds Your Plan",
      desc: "The adaptive engine calculates priority scores and fills your study hours intelligently.",
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "Execute & Track",
      desc: "Mark chapters done. The plan recalibrates automatically the next day.",
    },
  ];

  const comparisons = [
    { feature: "Plan Generation", free: "1 per day", pro: "Unlimited" },
    { feature: "Weakness Scale", free: "Max 3", pro: "Full 1–5" },
    { feature: "Study Mode Visibility", free: "Hidden", pro: "Full view" },
    { feature: "Analytics Dashboard", free: "Locked", pro: "Full access" },
    { feature: "Mark Done Limit", free: "10/month", pro: "Unlimited" },
    { feature: "Priority Scores", free: "Hidden", pro: "Visible" },
  ];

  const testimonials = [
    {
      name: "Aditya Kumar",
      rank: "AIR 847, JEE Advanced 2025",
      quote:
        "Examos removed decision fatigue completely. I knew exactly what to study each morning. The priority engine is genuinely smart.",
      avatar: "AK",
    },
    {
      name: "Priya Sharma",
      rank: "99.4 percentile, JEE Main 2025",
      quote:
        "I was wasting hours deciding what to revise. Examos made it obvious. My weak topics got attention at the right time.",
      avatar: "PS",
    },
    {
      name: "Rohan Mehta",
      rank: "AIR 2103, JEE Advanced 2025",
      quote:
        "The survival mode in the last 30 days kept me focused on what actually mattered. Exactly what I needed.",
      avatar: "RM",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.72 0.17 195 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 240 / 0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.94 0.01 250) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(0.94 0.01 250) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className="relative z-10 sticky top-0"
        style={{
          background: "oklch(0.13 0.015 250 / 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.28 0.02 250 / 0.5)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.72 0.17 195 / 0.15)",
                border: "1px solid oklch(0.72 0.17 195 / 0.4)",
              }}
            >
              <Zap className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Examos
            </span>
            <span
              className="hidden sm:block text-xs font-mono ml-1"
              style={{ color: "oklch(0.55 0.015 250)" }}
            >
              JEE Study Engine
            </span>
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="sm"
            className="font-display font-semibold text-sm h-9 px-5"
            style={{ background: PRIMARY, color: "oklch(0.10 0.02 250)" }}
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-semibold mb-8"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.12)",
                  border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                  color: PRIMARY,
                }}
              >
                <Zap className="w-3 h-3" />
                Adaptive Priority Engine
              </div>

              <h1
                className="font-display font-bold leading-[1.05] mb-6"
                style={{
                  fontSize: "clamp(2.8rem, 7vw, 5rem)",
                  color: "oklch(0.96 0.01 250)",
                  letterSpacing: "-0.03em",
                }}
              >
                Adaptive JEE{" "}
                <span
                  style={{
                    color: PRIMARY,
                    textShadow:
                      "0 0 40px oklch(0.72 0.17 195 / 0.5), 0 0 80px oklch(0.72 0.17 195 / 0.2)",
                  }}
                >
                  Study Engine
                </span>
              </h1>

              <p
                className="font-body text-lg leading-relaxed max-w-2xl mx-auto mb-10"
                style={{ color: "oklch(0.72 0.015 250)" }}
              >
                Stop guessing what to study next. Examos calculates priority
                scores for every chapter based on your weakness, urgency, and
                revision history — then fills your day automatically.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="font-display font-bold h-13 px-8 text-base w-full sm:w-auto rounded-xl"
                  style={{
                    background: PRIMARY,
                    color: "oklch(0.10 0.02 250)",
                    height: "52px",
                    fontSize: "1rem",
                    boxShadow: "0 0 30px oklch(0.72 0.17 195 / 0.3)",
                  }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start for Free
                    </>
                  )}
                </Button>
                <span
                  className="text-sm font-body"
                  style={{ color: "oklch(0.50 0.015 250)" }}
                >
                  No credit card required
                </span>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-10 mt-16 pt-10"
              style={{ borderTop: "1px solid oklch(0.28 0.02 250 / 0.4)" }}
            >
              {[
                { value: "90+", label: "JEE chapters" },
                { value: "4×", label: "Priority factors" },
                { value: "4", label: "Study modes" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-mono font-bold text-3xl tabular-nums"
                    style={{
                      color: PRIMARY,
                      textShadow: "0 0 20px oklch(0.72 0.17 195 / 0.35)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs font-body mt-1.5 uppercase tracking-wider"
                    style={{ color: "oklch(0.50 0.012 250)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="font-display font-bold text-3xl mb-3"
                style={{
                  letterSpacing: "-0.02em",
                  color: "oklch(0.94 0.01 250)",
                }}
              >
                How It Works
              </h2>
              <p
                className="font-body text-base"
                style={{ color: "oklch(0.55 0.015 250)" }}
              >
                Three steps to a smarter study routine
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative rounded-2xl p-8"
                  style={{
                    background: "oklch(0.16 0.018 250)",
                    border: "1px solid oklch(0.24 0.02 250)",
                  }}
                >
                  <div
                    className="font-mono text-xs font-bold mb-4 block"
                    style={{ color: "oklch(0.40 0.015 250)" }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: "oklch(0.72 0.17 195 / 0.12)",
                      border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                    }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>
                  <h3
                    className="font-display font-semibold text-lg mb-2"
                    style={{ color: "oklch(0.92 0.01 250)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "oklch(0.58 0.015 250)" }}
                  >
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Free vs Pro Comparison */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="font-display font-bold text-3xl mb-3"
                style={{
                  letterSpacing: "-0.02em",
                  color: "oklch(0.94 0.01 250)",
                }}
              >
                Free vs Pro
              </h2>
              <p
                className="font-body text-base"
                style={{ color: "oklch(0.55 0.015 250)" }}
              >
                Start free. Upgrade when you're ready for the full engine.
              </p>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.24 0.02 250)",
                background: "oklch(0.15 0.018 250)",
              }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-3 py-4 px-6"
                style={{ borderBottom: "1px solid oklch(0.24 0.02 250)" }}
              >
                <div
                  className="font-display font-semibold text-sm"
                  style={{ color: "oklch(0.55 0.015 250)" }}
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
                    className="inline-flex items-center gap-1.5 font-display font-semibold text-sm px-3 py-1 rounded-full"
                    style={{
                      background: "oklch(0.72 0.17 195 / 0.15)",
                      color: PRO_COLOR,
                      border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                    }}
                  >
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                </div>
              </div>

              {comparisons.map((row, i) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-3 py-3.5 px-6 items-center"
                  style={{
                    borderBottom:
                      i < comparisons.length - 1
                        ? "1px solid oklch(0.22 0.02 250 / 0.5)"
                        : undefined,
                    background:
                      i % 2 === 0
                        ? "oklch(0.17 0.018 250 / 0.5)"
                        : "transparent",
                  }}
                >
                  <span
                    className="font-body text-sm"
                    style={{ color: "oklch(0.75 0.01 250)" }}
                  >
                    {row.feature}
                  </span>
                  <div className="text-center">
                    <span
                      className="font-mono text-xs"
                      style={{ color: FREE_COLOR }}
                    >
                      {row.free === "Locked" || row.free === "Hidden" ? (
                        <XCircle
                          className="w-4 h-4 inline"
                          style={{ color: "oklch(0.62 0.22 25 / 0.7)" }}
                        />
                      ) : (
                        row.free
                      )}
                    </span>
                  </div>
                  <div className="text-center">
                    <span
                      className="font-mono text-xs"
                      style={{ color: PRO_COLOR }}
                    >
                      {row.pro === "Unlimited" ||
                      row.pro === "Visible" ||
                      row.pro === "Full access" ||
                      row.pro === "Full view" ? (
                        <CheckCircle
                          className="w-4 h-4 inline"
                          style={{ color: PRO_COLOR }}
                        />
                      ) : (
                        row.pro
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {/* CTA row */}
              <div
                className="grid grid-cols-3 py-5 px-6 items-center"
                style={{ borderTop: "1px solid oklch(0.24 0.02 250)" }}
              >
                <div />
                <div className="text-center">
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    size="sm"
                    className="font-display font-semibold text-xs h-8 px-4"
                    style={{
                      borderColor: "oklch(0.32 0.02 250)",
                      color: FREE_COLOR,
                    }}
                  >
                    Start Free
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    onClick={handleLogin}
                    size="sm"
                    className="font-display font-semibold text-xs h-8 px-4"
                    style={{
                      background: PRIMARY,
                      color: "oklch(0.10 0.02 250)",
                      boxShadow: "0 0 12px oklch(0.72 0.17 195 / 0.25)",
                    }}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Get Pro
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="font-display font-bold text-3xl mb-3"
                style={{
                  letterSpacing: "-0.02em",
                  color: "oklch(0.94 0.01 250)",
                }}
              >
                What Toppers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: "oklch(0.16 0.018 250)",
                    border: "1px solid oklch(0.24 0.02 250)",
                  }}
                >
                  <div
                    className="text-3xl mb-4 leading-none font-display font-bold"
                    style={{ color: "oklch(0.72 0.17 195 / 0.4)" }}
                  >
                    "
                  </div>
                  <p
                    className="font-body text-sm leading-relaxed mb-5"
                    style={{ color: "oklch(0.70 0.012 250)" }}
                  >
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold"
                      style={{
                        background: "oklch(0.72 0.17 195 / 0.15)",
                        color: PRIMARY,
                        border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p
                        className="text-sm font-display font-semibold"
                        style={{ color: "oklch(0.88 0.01 250)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs font-mono"
                        style={{ color: PRIMARY }}
                      >
                        {t.rank}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl p-12"
              style={{
                background: "oklch(0.16 0.025 210)",
                border: "1px solid oklch(0.72 0.17 195 / 0.2)",
                boxShadow: "0 0 60px oklch(0.72 0.17 195 / 0.08)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.15)",
                  border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                }}
              >
                <BarChart2 className="w-7 h-7" style={{ color: PRIMARY }} />
              </div>

              <h2
                className="font-display font-bold text-3xl mb-3"
                style={{
                  letterSpacing: "-0.02em",
                  color: "oklch(0.96 0.01 250)",
                }}
              >
                Join thousands of JEE aspirants
              </h2>
              <p
                className="font-body text-base mb-8"
                style={{ color: "oklch(0.58 0.015 250)" }}
              >
                Stop wasting study hours. Let Examos tell you exactly what to
                focus on every single day.
              </p>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="font-display font-bold h-12 px-10 text-base rounded-xl"
                style={{
                  background: PRIMARY,
                  color: "oklch(0.10 0.02 250)",
                  boxShadow: "0 0 30px oklch(0.72 0.17 195 / 0.3)",
                }}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Sign Up Free
                  </>
                )}
              </Button>

              <p
                className="text-xs font-body mt-4"
                style={{ color: "oklch(0.45 0.012 250)" }}
              >
                Secure, passwordless login via Internet Identity
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-6 px-6"
        style={{ borderColor: "oklch(0.22 0.02 250 / 0.5)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: PRIMARY }} />
            <span
              className="font-display font-semibold text-sm"
              style={{ color: "oklch(0.60 0.012 250)" }}
            >
              Examos
            </span>
          </div>
          <p
            className="text-xs font-body"
            style={{ color: "oklch(0.42 0.012 250)" }}
          >
            © {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.65 0.23 25)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "oklch(0.55 0.012 250)" }}
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Login overlay while processing */}
      <AnimatePresence>
        {showLogin && isLoggingIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              background: "oklch(0.10 0.015 250 / 0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.15)",
                  border: "1px solid oklch(0.72 0.17 195 / 0.3)",
                }}
              >
                <Zap className="w-7 h-7" style={{ color: PRIMARY }} />
              </div>
              <div
                className="flex items-center gap-2"
                style={{ color: "oklch(0.65 0.012 250)" }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-display text-sm">
                  Connecting to Internet Identity...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
