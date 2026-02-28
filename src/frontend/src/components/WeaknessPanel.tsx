import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ChevronDown, Crown, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserChapter } from "../backend.d";
import type { ProStatus } from "../hooks/useProStatus";
import { useUpdateWeakness } from "../hooks/useQueries";
import { formatLastStudied, getSubjectBadgeClass } from "../utils/planEngine";

interface WeaknessPanelProps {
  chapters: UserChapter[];
  isLoading: boolean;
  onWeaknessChange: (chapterName: string, weakness: number) => void;
  proStatus?: ProStatus;
}

const SUBJECTS = ["Physics", "Chemistry", "Maths"] as const;
type Subject = (typeof SUBJECTS)[number];

const WEAKNESS_LABELS: Record<number, string> = {
  1: "Strong",
  2: "Good",
  3: "Average",
  4: "Weak",
  5: "Critical",
};

const WEAKNESS_COLORS: Record<number, string> = {
  1: "oklch(0.72 0.17 145)",
  2: "oklch(0.72 0.14 165)",
  3: "oklch(0.72 0.18 60)",
  4: "oklch(0.70 0.20 40)",
  5: "oklch(0.65 0.23 25)",
};

const PRIMARY = "oklch(0.72 0.17 195)";

interface WeaknessSelectProps {
  value: number;
  onChange: (v: number) => void;
  isPending: boolean;
  maxValue: number;
}

function WeaknessSelect({
  value,
  onChange,
  isPending,
  maxValue,
}: WeaknessSelectProps) {
  const clampedValue = Math.min(value, maxValue);

  const handleChange = (v: number) => {
    if (v > maxValue) {
      toast.error(
        maxValue === 3
          ? "Upgrade to Pro to use weakness ratings 4–5."
          : "Invalid value.",
      );
      return;
    }
    onChange(v);
  };

  return (
    <div className="relative">
      {isPending && (
        <Loader2
          className="absolute right-7 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin z-10"
          style={{ color: PRIMARY }}
        />
      )}
      <select
        value={clampedValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        disabled={isPending}
        className="appearance-none text-xs font-display font-medium pl-2.5 pr-6 py-1.5 rounded-md border transition-colors cursor-pointer"
        style={{
          background: `oklch(${clampedValue <= 2 ? "0.72 0.17 145" : clampedValue === 3 ? "0.72 0.18 60" : clampedValue === 4 ? "0.70 0.20 40" : "0.65 0.23 25"} / 0.15)`,
          color: WEAKNESS_COLORS[clampedValue],
          borderColor: `${WEAKNESS_COLORS[clampedValue].slice(0, -1)} / 0.4)`,
        }}
      >
        {[1, 2, 3].map((v) => (
          <option
            key={v}
            value={v}
            style={{ background: "#1a2035", color: "white" }}
          >
            {v} — {WEAKNESS_LABELS[v]}
          </option>
        ))}
        {maxValue >= 4 && (
          <>
            <option value={4} style={{ background: "#1a2035", color: "white" }}>
              4 — {WEAKNESS_LABELS[4]}
            </option>
            <option value={5} style={{ background: "#1a2035", color: "white" }}>
              5 — {WEAKNESS_LABELS[5]}
            </option>
          </>
        )}
        {maxValue < 4 && (
          <>
            <option
              value={4}
              disabled
              style={{ background: "#1a2035", color: "#555" }}
            >
              4 — Weak (Pro)
            </option>
            <option
              value={5}
              disabled
              style={{ background: "#1a2035", color: "#555" }}
            >
              5 — Critical (Pro)
            </option>
          </>
        )}
      </select>
      <ChevronDown
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
        style={{ color: WEAKNESS_COLORS[clampedValue] }}
      />
    </div>
  );
}

interface ChapterRowProps {
  chapter: UserChapter;
  localWeakness: number;
  onWeaknessChange: (name: string, val: number) => void;
  pendingChapter: string | null;
  maxWeakness: number;
}

function ChapterRow({
  chapter,
  localWeakness,
  onWeaknessChange,
  pendingChapter,
  maxWeakness,
}: ChapterRowProps) {
  const isPending = pendingChapter === chapter.chapterName;
  const badgeClass = getSubjectBadgeClass(chapter.subject);

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors hover:bg-secondary/30">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-body truncate">
          {chapter.chapterName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className={`text-xs px-1 py-0.5 rounded font-display font-medium ${badgeClass}`}
          >
            {chapter.subject}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {Number(chapter.timesStudied)}× studied
          </span>
          <span className="text-xs text-muted-foreground">
            {formatLastStudied(chapter.lastStudiedAt)}
          </span>
        </div>
      </div>
      <WeaknessSelect
        value={localWeakness}
        onChange={(v) => onWeaknessChange(chapter.chapterName, v)}
        isPending={isPending}
        maxValue={maxWeakness}
      />
    </div>
  );
}

export default function WeaknessPanel({
  chapters,
  isLoading,
  onWeaknessChange,
  proStatus,
}: WeaknessPanelProps) {
  const [openSubject, setOpenSubject] = useState<Subject | null>("Physics");
  const [localWeaknesses, setLocalWeaknesses] = useState<
    Record<string, number>
  >({});
  const [pendingChapter, setPendingChapter] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const updateWeakness = useUpdateWeakness();

  const isPro = proStatus?.isPro ?? false;
  const maxWeakness = isPro ? 5 : 3;

  const getWeakness = useCallback(
    (ch: UserChapter) => {
      const raw = localWeaknesses[ch.chapterName] ?? Number(ch.weakness);
      return Math.min(raw, maxWeakness);
    },
    [localWeaknesses, maxWeakness],
  );

  const handleWeaknessChange = useCallback(
    (chapterName: string, val: number) => {
      const clampedVal = Math.min(val, maxWeakness);
      setLocalWeaknesses((prev) => ({ ...prev, [chapterName]: clampedVal }));
      onWeaknessChange(chapterName, clampedVal);

      if (debounceTimers.current[chapterName]) {
        clearTimeout(debounceTimers.current[chapterName]);
      }
      debounceTimers.current[chapterName] = setTimeout(async () => {
        setPendingChapter(chapterName);
        try {
          await updateWeakness.mutateAsync({
            chapterName,
            weakness: BigInt(clampedVal),
          });
        } catch {
          toast.error("Failed to save weakness rating.");
          setLocalWeaknesses((prev) => {
            const next = { ...prev };
            delete next[chapterName];
            return next;
          });
        } finally {
          setPendingChapter(null);
        }
      }, 800);
    },
    [onWeaknessChange, updateWeakness, maxWeakness],
  );

  const chaptersBySubject = useMemo(() => {
    const map: Record<Subject, UserChapter[]> = {
      Physics: [],
      Chemistry: [],
      Maths: [],
    };
    for (const ch of chapters) {
      const subj = ch.subject as Subject;
      if (map[subj]) map[subj].push(ch);
    }
    return map;
  }, [chapters]);

  const subjectColors: Record<Subject, string> = {
    Physics: "oklch(0.65 0.18 240)",
    Chemistry: "oklch(0.65 0.18 145)",
    Maths: "oklch(0.70 0.17 60)",
  };

  const getAvgWeakness = (subj: Subject): number => {
    const chs = chaptersBySubject[subj];
    if (!chs.length) return 0;
    const sum = chs.reduce((acc, ch) => acc + getWeakness(ch), 0);
    return sum / chs.length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl glass"
    >
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4" style={{ color: PRIMARY }} />
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">
            Weakness Control
          </h2>
          {!isPro && (
            <span
              className="ml-auto flex items-center gap-1 text-[10px] font-display font-semibold px-2 py-1 rounded"
              style={{
                background: "oklch(0.72 0.17 195 / 0.1)",
                color: PRIMARY,
                border: "1px solid oklch(0.72 0.17 195 / 0.2)",
              }}
            >
              <Crown className="w-2.5 h-2.5" />
              Pro unlocks 4–5 scale
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-5">
          Rate each chapter's difficulty.{" "}
          {isPro
            ? "Full 1–5 scale available."
            : "Free tier: ratings capped at 3. Upgrade for 4–5."}
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <Skeleton key={k} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {SUBJECTS.map((subject) => {
              const isOpen = openSubject === subject;
              const chs = chaptersBySubject[subject];
              const avg = getAvgWeakness(subject);
              const color = subjectColors[subject];

              return (
                <div
                  key={subject}
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid oklch(0.28 0.02 250)" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSubject(isOpen ? null : subject)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="font-display font-semibold text-sm text-foreground">
                        {subject}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {chs.length} chapters
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          avg
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div
                              key={dot}
                              className="w-1.5 h-1.5 rounded-full transition-all"
                              style={{
                                background:
                                  dot <= Math.round(avg)
                                    ? (WEAKNESS_COLORS[Math.round(avg)] ??
                                      WEAKNESS_COLORS[3])
                                    : "oklch(0.28 0.02 250)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-2 pb-2"
                          style={{
                            borderTop: "1px solid oklch(0.28 0.02 250)",
                          }}
                        >
                          <div
                            className="max-h-[400px] overflow-y-auto pr-1 mt-1"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            {chs.map((ch) => (
                              <ChapterRow
                                key={ch.chapterName}
                                chapter={ch}
                                localWeakness={getWeakness(ch)}
                                onWeaknessChange={handleWeaknessChange}
                                pendingChapter={pendingChapter}
                                maxWeakness={maxWeakness}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
