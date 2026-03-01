import {
  useGetDailyPlanCount,
  useGetDailyPracticeCount,
  useGetSubscription,
  useGetWeeklyMockCount,
} from "./useQueries";

export interface ProStatus {
  isPro: boolean;
  isLoading: boolean;
  canGeneratePlan: boolean;
  canMarkDone: boolean;
  canSetWeaknessAbove3: boolean;
  canSeeMode: boolean;
  canSeeAnalytics: boolean;
  canSeePriority: boolean;
  canPractice: boolean;
  canStartMock: boolean;
  dailyPlanCount: number;
  dailyPracticeCount: number;
  weeklyMockCount: number;
}

export function useProStatus(): ProStatus {
  const { data: subscription, isLoading: subLoading } = useGetSubscription();
  const { data: dailyPlanCountRaw, isLoading: dailyLoading } =
    useGetDailyPlanCount();
  const { data: dailyPracticeCountRaw, isLoading: practiceLoading } =
    useGetDailyPracticeCount();
  const { data: weeklyMockCountRaw, isLoading: mockLoading } =
    useGetWeeklyMockCount();

  const isPro = subscription?.isPro ?? false;
  const dailyPlanCount = Number(dailyPlanCountRaw ?? 0);
  const dailyPracticeCount = Number(dailyPracticeCountRaw ?? 0);
  const weeklyMockCount = Number(weeklyMockCountRaw ?? 0);

  return {
    isPro,
    isLoading: subLoading || dailyLoading || practiceLoading || mockLoading,
    canGeneratePlan: isPro || dailyPlanCount < 1,
    canMarkDone: true, // No longer limited
    canSetWeaknessAbove3: isPro,
    canSeeMode: isPro,
    canSeeAnalytics: isPro,
    canSeePriority: isPro,
    canPractice: isPro || dailyPracticeCount < 5,
    canStartMock: isPro || weeklyMockCount < 1,
    dailyPlanCount,
    dailyPracticeCount,
    weeklyMockCount,
  };
}
