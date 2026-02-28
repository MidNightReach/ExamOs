# Examos

## Current State

- Full-stack app with Motoko backend and React frontend
- Authentication via Internet Identity
- Backend stores: `UserProfile` (examType, examMonth, examYear, dailyStudyHours) and `UserChapter` (chapterName, subject, importance, weakness, timesStudied, lastStudiedAt)
- 90 JEE chapters pre-seeded across Physics, Chemistry, Maths with importance scores
- Priority engine: `importance × weakness × urgencyMultiplier × revisionFactor`
- Frontend: single-page Dashboard with header, ExamSetup, CountdownDisplay, TodaysPlan, WeaknessPanel
- No subscription system, no streak tracking, no materials section, no analytics, no landing page, no sidebar navigation

## Requested Changes (Diff)

### Add

**Backend:**
- `UserSubscription` type: `{ userId, isPro, subscriptionExpiresAt }` stored in a `userSubscriptions` map
- `DailyActivity` type: `{ date, chaptersMarkedDone }` stored per user for streak tracking
- `UserStreak` type: `{ lastActiveDate, currentStreak }` stored in `userStreaks` map
- `monthlyDoneCount` tracking per user (resets monthly) — stored as `{ month, count }` in `monthlyActivity` map
- `getPlanGenerationCount` / `incrementPlanCount` — track daily plan generation per user in `dailyPlanCounts` map (resets daily)
- Backend functions: `getSubscription`, `togglePro` (for testing — sets is_pro without payment), `getStreak`, `getMonthlyDoneCount`, `getDailyPlanCount`, `incrementDailyPlanCount`
- Streak update logic inside `markChapterDone`: if today != lastActiveDate → increment streak (or reset if gap > 1 day); update lastActiveDate and monthlyDoneCount

**Frontend pages/sections:**
- `LandingPage` component: shown to unauthenticated users instead of LoginPage; sections: Hero, How It Works (3 steps), Free vs Pro comparison table, Testimonials placeholder, CTA
- `Sidebar` component: navigation with icons — Dashboard, Today's Plan, Weakness Settings, Materials, Analytics (Pro badge), Subscription
- `MaterialsPage` component: Physics / Chemistry / Maths tabs; collapsible chapter sections per subject; structured lists (formulas, key topics, common mistakes, reactions, identities, standard problems)
- `AnalyticsPage` component (Pro only, blurred for free): total chapters studied, study streak, weakest subject, most studied subject, mode distribution history, bar chart of chapters by subject
- `SubscriptionPage` component: current plan status, feature comparison table, "Upgrade to Pro" toggle (no payment — just calls togglePro), subscription expiry display
- Streak display widget on Dashboard (shows current streak)
- Pro/Free gating logic throughout: weakness max cap at 3 for free, plan generation limit (1/day) for free, mode label hidden for free, mark-done limit (10/month) for free, analytics behind Pro gate

### Modify

- `markChapterDone` backend: add streak update logic and monthly count increment
- `updateWeakness` backend: enforce max weakness=3 for free users (check isPro before saving)
- `Dashboard` component: replace full-page layout with sidebar+content layout; add streak widget; add pro/free context provider
- `App.tsx`: route to LandingPage for unauthenticated users; add client-side routing between sidebar sections
- `CountdownDisplay`: show full mode label (Foundation/Build/Intensive/Survival) only for Pro; free users see only "X days left"
- `TodaysPlan`: show priority scores only for Pro; enforce 1 plan/day generation limit for free users with upgrade prompt
- `WeaknessPanel`: cap weakness slider at 3 for free users with upgrade prompt on hover

### Remove

- `LoginPage` component (replaced by LandingPage with integrated login CTA)

## Implementation Plan

1. **Backend:** Add subscription, streak, monthly/daily count types and storage maps; update `markChapterDone` to handle streak + monthly tracking; add `togglePro`, `getSubscription`, `getStreak`, `getMonthlyDoneCount`, `getDailyPlanCount`, `incrementDailyPlanCount` functions
2. **Frontend — ProContext:** Create `useProStatus` hook that fetches subscription and exposes `isPro` boolean + feature limit checks (`canGeneratePlan`, `canMarkDone`, `canSetWeakness`, etc.)
3. **Frontend — Routing:** Implement tab-based routing (no URL change needed) using a `currentSection` state in App; render correct page component based on active section
4. **Frontend — LandingPage:** Build marketing landing page with Hero, How It Works, Free vs Pro table, Testimonials, CTA; wire login button
5. **Frontend — Sidebar + Layout:** Replace header-only layout with sidebar nav on desktop, bottom nav on mobile; sidebar items: Dashboard, Today's Plan, Weakness Settings, Materials, Analytics, Subscription
6. **Frontend — Gating:** Apply all free-tier restrictions using ProContext throughout Dashboard, TodaysPlan, WeaknessPanel, CountdownDisplay
7. **Frontend — MaterialsPage:** Static structured content organized by subject with collapsible sections; Physics formulas/topics/mistakes, Chemistry reactions/named reactions/trends, Maths formulas/identities/problem types
8. **Frontend — AnalyticsPage:** Pro-only dashboard with stat cards and bar chart; free users see blurred overlay with lock icon and upgrade prompt
9. **Frontend — SubscriptionPage:** Plan status card, feature comparison, toggle Pro button (dev/demo mode)
10. **Frontend — Streak widget:** Display current streak on main Dashboard
