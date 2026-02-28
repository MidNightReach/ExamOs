import type { UserChapter } from "../backend.d";

export interface PlanItem extends UserChapter {
  priority: number;
  hoursNeeded: number;
  allocatedHours: number;
}

export function getExamDate(
  examType: string,
  examMonth: string,
  examYear: bigint,
): Date | null {
  const year = Number(examYear);
  if (!year) return null;

  if (examType === "Main") {
    if (examMonth === "Jan") return new Date(year, 0, 26); // Jan 26
    if (examMonth === "Apr") return new Date(year, 3, 6); // Apr 6
  } else if (examType === "Advanced") {
    return new Date(year, 4, 25); // May 25
  }
  return null;
}

export function getDaysLeft(examDate: Date | null): number | null {
  if (!examDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = examDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export type StudyMode = "Foundation" | "Build" | "Intensive" | "Survival";

export function getMode(daysLeft: number): StudyMode {
  if (daysLeft > 180) return "Foundation";
  if (daysLeft > 90) return "Build";
  if (daysLeft > 30) return "Intensive";
  return "Survival";
}

export function getUrgencyMultiplier(daysLeft: number): number {
  if (daysLeft > 180) return 1;
  if (daysLeft > 90) return 1.2;
  if (daysLeft > 30) return 1.5;
  return 2;
}

export function generatePlan(
  chapters: UserChapter[],
  dailyHours: number,
  daysLeft: number,
): PlanItem[] {
  const urgencyMultiplier = getUrgencyMultiplier(daysLeft);

  const scored = chapters.map((ch) => {
    const stage = Math.min(Number(ch.timesStudied), 3);
    const revisionFactor = 4 - stage;
    const priority =
      Number(ch.importance) *
      Number(ch.weakness) *
      urgencyMultiplier *
      revisionFactor;
    const baseHours = Number(ch.importance) * 2;
    const hoursNeeded = Math.max(
      0.5,
      Math.round((baseHours / urgencyMultiplier) * 2) / 2,
    );
    return { ...ch, priority, hoursNeeded, allocatedHours: 0 };
  });

  scored.sort((a, b) => b.priority - a.priority);

  const plan: PlanItem[] = [];
  let remaining = dailyHours;

  for (const ch of scored) {
    if (remaining <= 0) break;
    const hrs = Math.min(ch.hoursNeeded, remaining);
    plan.push({ ...ch, allocatedHours: hrs });
    remaining -= hrs;
  }

  return plan;
}

export function formatLastStudied(nanoseconds?: bigint): string {
  if (!nanoseconds) return "Never";
  const ms = Number(nanoseconds) / 1_000_000;
  const date = new Date(ms);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function getModeColorClass(mode: StudyMode): string {
  const map: Record<StudyMode, string> = {
    Foundation: "mode-foundation",
    Build: "mode-build",
    Intensive: "mode-intensive",
    Survival: "mode-survival",
  };
  return map[mode];
}

export function getSubjectBadgeClass(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === "physics") return "subject-badge-physics";
  if (lower === "chemistry") return "subject-badge-chemistry";
  if (lower === "maths") return "subject-badge-maths";
  return "";
}
