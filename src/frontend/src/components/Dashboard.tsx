import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import type { UserChapter } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetChapters,
  useGetProfile,
  useSaveProfile,
} from "../hooks/useQueries";
import { getDaysLeft, getExamDate } from "../utils/planEngine";
import CountdownDisplay from "./CountdownDisplay";
import ExamSetup from "./ExamSetup";
import TodaysPlan from "./TodaysPlan";
import WeaknessPanel from "./WeaknessPanel";

export default function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: chapters = [], isLoading: chaptersLoading } = useGetChapters();
  const saveProfile = useSaveProfile();

  // Local chapter overrides for optimistic updates
  const [localChapters, setLocalChapters] = useState<UserChapter[]>([]);
  const [localHours, setLocalHours] = useState<number>(6);

  // Merge backend chapters with local optimistic overrides
  const mergedChapters: UserChapter[] =
    localChapters.length > 0 ? localChapters : chapters;

  // Sync localChapters once backend data arrives (and local is empty)
  if (chapters.length > 0 && localChapters.length === 0) {
    setLocalChapters(chapters);
  }

  const handleChapterDone = useCallback((chapterName: string) => {
    setLocalChapters((prev) =>
      prev.map((ch) =>
        ch.chapterName === chapterName
          ? {
              ...ch,
              timesStudied: BigInt(Number(ch.timesStudied) + 1),
              lastStudiedAt: BigInt(Date.now() * 1_000_000),
            }
          : ch,
      ),
    );
  }, []);

  const handleWeaknessChange = useCallback(
    (chapterName: string, weakness: number) => {
      setLocalChapters((prev) =>
        prev.map((ch) =>
          ch.chapterName === chapterName
            ? { ...ch, weakness: BigInt(weakness) }
            : ch,
        ),
      );
    },
    [],
  );

  const handleHoursChange = useCallback(
    async (hours: number) => {
      setLocalHours(hours);
      if (profile) {
        try {
          await saveProfile.mutateAsync({
            examType: profile.examType,
            examMonth: profile.examMonth,
            examYear: profile.examYear,
            dailyStudyHours: hours,
          });
        } catch {
          // Silent fail – not critical
        }
      }
    },
    [profile, saveProfile],
  );

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setLocalChapters([]);
  };

  const handleProfileSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  // Calculate daysLeft for plan generation
  const examDate = profile
    ? getExamDate(profile.examType, profile.examMonth, profile.examYear)
    : null;
  const daysLeft = getDaysLeft(examDate);

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : "";

  const currentHours = profile?.dailyStudyHours ?? localHours;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border/50"
        style={{
          background: "oklch(0.13 0.015 250 / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.72 0.17 195 / 0.15)",
                border: "1px solid oklch(0.72 0.17 195 / 0.3)",
              }}
            >
              <Zap
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.72 0.17 195)" }}
              />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Examos
            </span>
          </div>

          <div className="flex items-center gap-3">
            {principalShort && (
              <span className="hidden sm:block font-mono text-xs text-muted-foreground">
                {principalShort}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-3 text-xs font-display text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {profileLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left column */}
            <div className="lg:col-span-1 space-y-4">
              <ExamSetup
                profile={profile ?? null}
                onSaved={handleProfileSaved}
              />
              <CountdownDisplay profile={profile ?? null} />
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Plan — most prominent */}
              <TodaysPlan
                chapters={mergedChapters}
                daysLeft={daysLeft}
                initialHours={currentHours}
                onHoursChange={handleHoursChange}
                onChapterDone={handleChapterDone}
              />

              {/* Weakness Panel */}
              <WeaknessPanel
                chapters={mergedChapters}
                isLoading={chaptersLoading}
                onWeaknessChange={handleWeaknessChange}
              />
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
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
          </p>
        </div>
      </footer>
    </div>
  );
}
