import {
  useGetDailyPlanCount,
  useGetMonthlyDoneCount,
  useGetSubscription,
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
  monthlyDoneCount: number;
  dailyPlanCount: number;
}

export function useProStatus(): ProStatus {
  const { data: subscription, isLoading: subLoading } = useGetSubscription();
  const { data: monthlyDoneCountRaw, isLoading: monthlyLoading } =
    useGetMonthlyDoneCount();
  const { data: dailyPlanCountRaw, isLoading: dailyLoading } =
    useGetDailyPlanCount();

  const isPro = subscription?.isPro ?? false;
  const monthlyDoneCount = Number(monthlyDoneCountRaw ?? 0);
  const dailyPlanCount = Number(dailyPlanCountRaw ?? 0);

  return {
    isPro,
    isLoading: subLoading || monthlyLoading || dailyLoading,
    canGeneratePlan: isPro || dailyPlanCount < 1,
    canMarkDone: isPro || monthlyDoneCount < 10,
    canSetWeaknessAbove3: isPro,
    canSeeMode: isPro,
    canSeeAnalytics: isPro,
    canSeePriority: isPro,
    monthlyDoneCount,
    dailyPlanCount,
  };
}
