import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "";
        if (msg === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const features = [
    { icon: Target, text: "Priority-ranked daily plans" },
    { icon: TrendingUp, text: "Adapts to your weakness" },
    { icon: Zap, text: "Urgency-aware scheduling" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.17 195 / 0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 240 / 0.05) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.94 0.01 250) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(0.94 0.01 250) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.72 0.17 195 / 0.15)",
                border: "1px solid oklch(0.72 0.17 195 / 0.4)",
              }}
            >
              <Zap
                className="w-5 h-5"
                style={{ color: "oklch(0.72 0.17 195)" }}
              />
            </div>
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              Examos
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground font-body text-base tracking-wide"
          >
            Adaptive JEE Study Planning
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-xl p-8 glass"
        >
          <h1 className="font-display text-xl font-semibold mb-2 text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to access your adaptive study plan.
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.72 0.17 195 / 0.1)",
                    border: "1px solid oklch(0.72 0.17 195 / 0.25)",
                  }}
                >
                  <f.icon
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.72 0.17 195)" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{f.text}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="w-full font-display font-semibold h-11 text-sm"
            style={{
              background: isLoggingIn
                ? "oklch(0.72 0.17 195 / 0.6)"
                : "oklch(0.72 0.17 195)",
              color: "oklch(0.10 0.02 250)",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure, passwordless login via ICP
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          © {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.65 0.23 25)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
