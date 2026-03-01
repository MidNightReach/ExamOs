import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "examos-theme";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

// Initialize theme immediately (before React renders)
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme());
}

// Global listeners so all hook instances stay in sync
const listeners = new Set<(theme: Theme) => void>();

function setGlobalTheme(theme: Theme) {
  applyTheme(theme);
  for (const fn of listeners) fn(theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const handler = (t: Theme) => setTheme(t);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setGlobalTheme(next);
  }, [theme]);

  return { theme, toggle, isDark: theme === "dark" };
}
