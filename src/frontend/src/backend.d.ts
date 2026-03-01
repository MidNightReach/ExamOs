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
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PYQQuestion {
    id: string;
    correctOption: string;
    subject: string;
    difficulty: string;
    year: bigint;
    questionText: string;
    chapter: string;
    examType: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MockResult {
    id: string;
    score: bigint;
    totalQuestions: bigint;
    mathsCorrect: bigint;
    timestamp: bigint;
    chemCorrect: bigint;
    physicsCorrect: bigint;
    accuracy: number;
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
    addQuestion(questionText: string, optionA: string, optionB: string, optionC: string, optionD: string, correctOption: string, year: bigint, subject: string, chapter: string, difficulty: string, examType: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteQuestion(id: string): Promise<boolean>;
    generateSolution(questionText: string, optionA: string, optionB: string, optionC: string, optionD: string, correctOption: string): Promise<string>;
    getAllUsers(): Promise<Array<string>>;
    getCallerUserRole(): Promise<UserRole>;
    getChapters(): Promise<Array<UserChapter>>;
    getDailyPlanCount(): Promise<bigint>;
    getDailyPracticeCount(): Promise<bigint>;
    getMockResults(): Promise<Array<MockResult>>;
    getMonthlyDoneCount(): Promise<bigint>;
    getProfile(): Promise<UserProfile | null>;
    getQuestions(): Promise<Array<PYQQuestion>>;
    getQuestionsByFilter(subject: string, chapter: string, difficulty: string, examType: string): Promise<Array<PYQQuestion>>;
    getStreak(): Promise<UserStreak>;
    getSubscription(): Promise<UserSubscription>;
    getWeeklyMockCount(): Promise<bigint>;
    incrementDailyPlanCount(): Promise<bigint>;
    incrementDailyPracticeCount(): Promise<bigint>;
    incrementWeeklyMockCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markChapterDone(chapterName: string): Promise<boolean>;
    saveMockResult(score: bigint, totalQuestions: bigint, accuracy: number, physicsCorrect: bigint, chemCorrect: bigint, mathsCorrect: bigint): Promise<string>;
    saveProfile(examType: string, examMonth: string, examYear: bigint, dailyStudyHours: number): Promise<void>;
    seedQuestions(): Promise<void>;
    setOpenAiKey(key: string): Promise<void>;
    setUserPro(userPrincipal: string, isPro: boolean): Promise<boolean>;
    togglePro(): Promise<UserSubscription>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePerformanceWeakness(chapterName: string, accuracy: number): Promise<boolean>;
    updateQuestion(id: string, questionText: string, optionA: string, optionB: string, optionC: string, optionD: string, correctOption: string, year: bigint, subject: string, chapter: string, difficulty: string, examType: string): Promise<boolean>;
    updateWeakness(chapterName: string, weakness: bigint): Promise<boolean>;
}
