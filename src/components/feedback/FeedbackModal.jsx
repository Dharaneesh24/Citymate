import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const OPTIONS = [
  { key: "improvement", emoji: "💡", label: "What can be improved?" },
  { key: "place_suggestion", emoji: "📍", label: "Suggest an important place" },
  { key: "general", emoji: "📝", label: "General feedback" },
];

export default function FeedbackModal({ open, onOpenChange }) {
  const [selectedType, setSelectedType] = useState(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setText("");
      setSuccess(false);
      setSubmitting(false);
      setSaveError(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedType || !text.trim() || submitting) return;
    setSubmitting(true);
    setSaveError(false);
    try {
      await base44.entities.Feedback.create({
        feedback_type: selectedType,
        feedback_text: text.trim(),
      });
      setSuccess(true);
    } catch {
      setSaveError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        {success ? (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <CheckCircle2 className="w-14 h-14 text-primary" />
            <DialogTitle className="text-xl font-bold font-heading">Thanks!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your feedback was saved in this browser.
            </DialogDescription>
            <Button onClick={() => onOpenChange(false)} className="mt-3 w-full h-11">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading">
                Help us improve CityMate !
              </DialogTitle>
              <DialogDescription>What would you like to tell us?</DialogDescription>
            </DialogHeader>

            {/* Options — selected-pill styling consistent with FilterBar */}
            <div className="flex flex-col gap-2">
              {OPTIONS.map((opt) => {
                const isActive = selectedType === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedType(opt.key)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground border-[#e0e0e0] hover:border-primary/40"
                    }`}
                  >
                    <span className="text-lg leading-none">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Text input — appears after selection */}
            {selectedType && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Tell us more</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your feedback..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            )}

            {saveError && (
              <p role="alert" className="text-sm text-destructive">
                CityMate couldn’t save your feedback. Check your browser storage settings and try again.
              </p>
            )}

            {/* Submit — disabled until text entered; blocks duplicate submissions */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedType || !text.trim() || submitting}
              className="w-full h-11 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
