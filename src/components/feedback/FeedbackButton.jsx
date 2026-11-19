import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackButton({ compact = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Feedback"
        aria-label="Feedback"
        className="inline-flex items-center gap-1.5 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/25 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {!compact && <span>Feedback</span>}
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
