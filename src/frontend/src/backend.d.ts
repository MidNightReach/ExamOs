import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserStreak {
    lastActiveDate: string;
    currentStreak: bigint;
}
export interface UserSubscription {
    subscriptionExpiresAt?: bigint;
    isPro: boolean;
}
export interface UserProfile {
    dailyStudyHours: number;
    examType: string;
    examYear: bigint;
    examMonth: string;
}
export interface UserChapter {
    subject: string;
    importance: bigint;
    lastStudiedAt?: bigint;
    weakness: bigint;
    timesStudied: bigint;
    chapterName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getChapters(): Promise<Array<UserChapter>>;
    getDailyPlanCount(): Promise<bigint>;
    getMonthlyDoneCount(): Promise<bigint>;
    getProfile(): Promise<UserProfile | null>;
    getStreak(): Promise<UserStreak>;
    getSubscription(): Promise<UserSubscription>;
    incrementDailyPlanCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markChapterDone(chapterName: string): Promise<boolean>;
    saveProfile(examType: string, examMonth: string, examYear: bigint, dailyStudyHours: number): Promise<void>;
    togglePro(): Promise<UserSubscription>;
    updateWeakness(chapterName: string, weakness: bigint): Promise<boolean>;
}
