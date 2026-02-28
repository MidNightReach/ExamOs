import { Loader2, Zap } from "lucide-react";
import AppShell from "./components/AppShell";
import LandingPage from "./components/LandingPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

function InitializingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.72 0.17 195 / 0.15)",
            border: "1px solid oklch(0.72 0.17 195 / 0.3)",
          }}
        >
          <Zap className="w-6 h-6" style={{ color: "oklch(0.72 0.17 195)" }} />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-display text-sm">Loading Examos...</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return <InitializingScreen />;
  }

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AppShell />;
}
