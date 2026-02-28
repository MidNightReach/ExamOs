import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { UserChapter } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProStatus } from "../hooks/useProStatus";
import {
  useGetChapters,
  useGetProfile,
  useSaveProfile,
} from "../hooks/useQueries";
import { getDaysLeft, getExamDate } from "../utils/planEngine";
import AnalyticsPage from "./AnalyticsPage";
import DashboardPage from "./DashboardPage";
import MaterialsPage from "./MaterialsPage";
import Sidebar, { type SectionId } from "./Sidebar";
import SubscriptionPage from "./SubscriptionPage";
import TodaysPlan from "./TodaysPlan";
import WeaknessPanel from "./WeaknessPanel";

export default function AppShell() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState<SectionId>("dashboard");
  const [localChapters, setLocalChapters] = useState<UserChapter[]>([]);
  const [localHours, setLocalHours] = useState<number>(6);

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: chapters = [], isLoading: chaptersLoading } = useGetChapters();
  const saveProfile = useSaveProfile();
  const proStatus = useProStatus();

  const mergedChapters: UserChapter[] =
    localChapters.length > 0 ? localChapters : chapters;

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
          // Silent fail
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

  const examDate = profile
    ? getExamDate(profile.examType, profile.examMonth, profile.examYear)
    : null;
  const daysLeft = getDaysLeft(examDate);

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 12)}...`
    : "";

  const currentHours = profile?.dailyStudyHours ?? localHours;

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <DashboardPage
            profile={profile ?? null}
            chapters={mergedChapters}
            daysLeft={daysLeft}
            profileLoading={profileLoading}
            proStatus={proStatus}
            onProfileSaved={handleProfileSaved}
            onNavigate={setCurrentSection}
          />
        );
      case "plan":
        return (
          <TodaysPlan
            chapters={mergedChapters}
            daysLeft={daysLeft}
            initialHours={currentHours}
            onHoursChange={handleHoursChange}
            onChapterDone={handleChapterDone}
            proStatus={proStatus}
          />
        );
      case "weakness":
        return (
          <WeaknessPanel
            chapters={mergedChapters}
            isLoading={chaptersLoading}
            onWeaknessChange={handleWeaknessChange}
            proStatus={proStatus}
          />
        );
      case "materials":
        return <MaterialsPage />;
      case "analytics":
        return (
          <AnalyticsPage
            chapters={mergedChapters}
            proStatus={proStatus}
            onUpgrade={() => setCurrentSection("subscription")}
          />
        );
      case "subscription":
        return <SubscriptionPage proStatus={proStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
      <Toaster />

      {/* Sidebar (desktop fixed, mobile overlay) */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        onLogout={handleLogout}
        principalShort={principalShort}
        proStatus={proStatus}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:overflow-y-auto min-w-0">
        {/* Desktop: small top bar with user info */}
        <div
          className="hidden lg:flex items-center justify-between px-6 h-12 flex-shrink-0"
          style={{
            background: "oklch(0.13 0.015 250 / 0.85)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid oklch(0.22 0.02 250 / 0.5)",
          }}
        >
          <div />
          <div className="flex items-center gap-4">
            {principalShort && (
              <span
                className="font-mono text-xs"
                style={{ color: "oklch(0.38 0.012 250)" }}
              >
                {principalShort}
              </span>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-6 pb-24 lg:pb-6 overflow-y-auto">
          {renderSection()}
        </main>

        {/* Footer */}
        <footer
          className="hidden lg:block border-t py-4 px-6"
          style={{ borderColor: "oklch(0.20 0.02 250 / 0.5)" }}
        >
          <p
            className="text-center text-xs font-body"
            style={{ color: "oklch(0.38 0.012 250)" }}
          >
            © {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.65 0.23 25)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              style={{ color: "oklch(0.45 0.012 250)" }}
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
