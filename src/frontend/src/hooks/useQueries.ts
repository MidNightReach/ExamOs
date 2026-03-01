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

// ── PYQ Questions ──────────────────────────────────────────────────────────────

import type { MockResult, PYQQuestion } from "../backend.d";

export function useGetQuestions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PYQQuestion[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetQuestionsByFilter(
  subject: string,
  chapter: string,
  difficulty: string,
  examType: string,
  enabled: boolean,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PYQQuestion[]>({
    queryKey: ["questions", subject, chapter, difficulty, examType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestionsByFilter(subject, chapter, difficulty, examType);
    },
    enabled: !!actor && !actorFetching && enabled,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      year: bigint;
      subject: string;
      chapter: string;
      difficulty: string;
      examType: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addQuestion(
        params.questionText,
        params.optionA,
        params.optionB,
        params.optionC,
        params.optionD,
        params.correctOption,
        params.year,
        params.subject,
        params.chapter,
        params.difficulty,
        params.examType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      year: bigint;
      subject: string;
      chapter: string;
      difficulty: string;
      examType: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateQuestion(
        params.id,
        params.questionText,
        params.optionA,
        params.optionB,
        params.optionC,
        params.optionD,
        params.correctOption,
        params.year,
        params.subject,
        params.chapter,
        params.difficulty,
        params.examType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useSeedQuestions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedQuestions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

// ── AI Solution ────────────────────────────────────────────────────────────────

export function useGenerateSolution() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateSolution(
        params.questionText,
        params.optionA,
        params.optionB,
        params.optionC,
        params.optionD,
        params.correctOption,
      );
    },
  });
}

export function useSetOpenAiKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setOpenAiKey(key);
    },
  });
}

// ── Practice Count ────────────────────────────────────────────────────────────

export function useGetDailyPracticeCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["dailyPracticeCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailyPracticeCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIncrementDailyPracticeCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementDailyPracticeCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyPracticeCount"] });
    },
  });
}

// ── Weekly Mock Count ─────────────────────────────────────────────────────────

export function useGetWeeklyMockCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["weeklyMockCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWeeklyMockCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIncrementWeeklyMockCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementWeeklyMockCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyMockCount"] });
    },
  });
}

// ── Mock Results ──────────────────────────────────────────────────────────────

export function useGetMockResults() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MockResult[]>({
    queryKey: ["mockResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMockResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveMockResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      score: bigint;
      totalQuestions: bigint;
      accuracy: number;
      physicsCorrect: bigint;
      chemCorrect: bigint;
      mathsCorrect: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveMockResult(
        params.score,
        params.totalQuestions,
        params.accuracy,
        params.physicsCorrect,
        params.chemCorrect,
        params.mathsCorrect,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockResults"] });
    },
  });
}

// ── Performance Weakness ──────────────────────────────────────────────────────

export function useUpdatePerformanceWeakness() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { chapterName: string; accuracy: number }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePerformanceWeakness(
        params.chapterName,
        params.accuracy,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllUsers();
    },
  });
}

export function useSetUserPro() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { userPrincipal: string; isPro: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserPro(params.userPrincipal, params.isPro);
    },
  });
}
