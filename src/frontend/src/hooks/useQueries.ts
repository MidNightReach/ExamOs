import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UserChapter,
  UserProfile,
  UserStreak,
  UserSubscription,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Profile ──────────────────────────────────────────────────────────────────

export function useGetProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examType,
      examMonth,
      examYear,
      dailyStudyHours,
    }: {
      examType: string;
      examMonth: string;
      examYear: bigint;
      dailyStudyHours: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveProfile(examType, examMonth, examYear, dailyStudyHours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ── Chapters ─────────────────────────────────────────────────────────────────

export function useGetChapters() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserChapter[]>({
    queryKey: ["chapters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChapters();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useUpdateWeakness() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterName,
      weakness,
    }: {
      chapterName: string;
      weakness: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateWeakness(chapterName, weakness);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

export function useMarkChapterDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterName }: { chapterName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markChapterDone(chapterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyDoneCount"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

// ── Subscription ──────────────────────────────────────────────────────────────

export function useGetSubscription() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserSubscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return { isPro: false };
      return actor.getSubscription();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useTogglePro() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.togglePro();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

// ── Streak ────────────────────────────────────────────────────────────────────

export function useGetStreak() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserStreak>({
    queryKey: ["streak"],
    queryFn: async () => {
      if (!actor) return { lastActiveDate: "", currentStreak: BigInt(0) };
      return actor.getStreak();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Monthly Done Count ────────────────────────────────────────────────────────

export function useGetMonthlyDoneCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["monthlyDoneCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMonthlyDoneCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Daily Plan Count ──────────────────────────────────────────────────────────

export function useGetDailyPlanCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["dailyPlanCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailyPlanCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIncrementDailyPlanCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementDailyPlanCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyPlanCount"] });
    },
  });
}
