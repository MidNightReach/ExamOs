import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useSaveProfile } from "../hooks/useQueries";

interface ExamSetupProps {
  profile: UserProfile | null;
  onSaved: () => void;
}

type ExamType = "Main" | "Advanced";
type ExamMonth = "Jan" | "Apr";

export default function ExamSetup({ profile, onSaved }: ExamSetupProps) {
  const [examType, setExamType] = useState<ExamType>("Main");
  const [examMonth, setExamMonth] = useState<ExamMonth>("Jan");
  const [examYear, setExamYear] = useState<string>("2026");
  const saveProfile = useSaveProfile();

  // Prefill from existing profile
  useEffect(() => {
    if (profile) {
      setExamType((profile.examType as ExamType) || "Main");
      setExamMonth((profile.examMonth as ExamMonth) || "Jan");
      setExamYear(profile.examYear ? String(profile.examYear) : "2026");
    }
  }, [profile]);

  const handleSave = async () => {
    const year = Number.parseInt(examYear, 10);
    if (!year || year < 2025 || year > 2030) {
      toast.error("Enter a valid year (2025–2030)");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        examType,
        examMonth: examType === "Main" ? examMonth : "May",
        examYear: BigInt(year),
        dailyStudyHours: profile?.dailyStudyHours ?? 6,
      });
      toast.success("Exam details saved");
      onSaved();
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const isPending = saveProfile.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-6 glass"
    >
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays
          className="w-4 h-4"
          style={{ color: "oklch(0.72 0.17 195)" }}
        />
        <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">
          Exam Setup
        </h2>
      </div>

      <div className="space-y-5">
        {/* Exam Type */}
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Exam
          </Label>
          <div className="flex gap-2">
            {(["Main", "Advanced"] as ExamType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setExamType(t)}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-display font-medium transition-all"
                style={
                  examType === t
                    ? {
                        background: "oklch(0.72 0.17 195 / 0.15)",
                        color: "oklch(0.72 0.17 195)",
                        border: "1px solid oklch(0.72 0.17 195 / 0.5)",
                      }
                    : {
                        background: "oklch(0.22 0.02 250 / 0.5)",
                        color: "oklch(0.55 0.015 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                      }
                }
              >
                JEE {t}
              </button>
            ))}
          </div>
        </div>

        {/* Month (only for Main) */}
        {examType === "Main" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Session
            </Label>
            <div className="flex gap-2">
              {(["Jan", "Apr"] as ExamMonth[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setExamMonth(m)}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-display font-medium transition-all"
                  style={
                    examMonth === m
                      ? {
                          background: "oklch(0.72 0.17 195 / 0.12)",
                          color: "oklch(0.72 0.17 195)",
                          border: "1px solid oklch(0.72 0.17 195 / 0.4)",
                        }
                      : {
                          background: "oklch(0.22 0.02 250 / 0.5)",
                          color: "oklch(0.55 0.015 250)",
                          border: "1px solid oklch(0.28 0.02 250)",
                        }
                  }
                >
                  {m === "Jan" ? "January" : "April"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {examType === "Advanced" && (
          <div className="text-xs text-muted-foreground">
            JEE Advanced is held in{" "}
            <span style={{ color: "oklch(0.72 0.17 195)" }}>May</span>
          </div>
        )}

        {/* Year */}
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Year
          </Label>
          <Input
            type="number"
            value={examYear}
            onChange={(e) => setExamYear(e.target.value)}
            min={2025}
            max={2030}
            placeholder="2026"
            className="font-mono text-sm h-9 bg-secondary/50 border-border focus:border-primary/50"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          size="sm"
          className="font-display font-semibold text-sm"
          style={{
            background: "oklch(0.72 0.17 195)",
            color: "oklch(0.10 0.02 250)",
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-3.5 w-3.5" />
              Save
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
