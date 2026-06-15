import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { commands } from "@/bindings";
import { Button } from "./ui/Button";

interface CorrectionDialogProps {
  historyId: number;
  originalText: string;
  onClose: () => void;
}

export const CorrectionDialog: React.FC<CorrectionDialogProps> = ({
  historyId: _historyId,
  originalText,
  onClose,
}) => {
  const [text, setText] = useState(originalText);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleSubmit = async () => {
    const corrected = text.trim();
    if (!corrected || corrected === originalText) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      const result = await commands.saveCorrection(originalText, corrected);
      if (result.status === "ok") {
        toast.success("Corecție salvată. Viitoarele transcrieri vor fi îmbunătățite.");
      } else {
        toast.error("Nu s-a putut salva corecția");
      }
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border border-mid-gray/20 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-sm">Corectează transcrierea</h2>
            <p className="text-xs text-text/50 mt-0.5">
              Corecțiile vor fi aplicate automat în viitor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text/40 hover:text-text transition-colors rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text/50">Text original (greșit)</label>
          <p className="text-sm text-text/50 italic line-through bg-mid-gray/10 rounded-md px-3 py-2">
            {originalText}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text/50">
            Text corectat (Enter pentru a salva, Shift+Enter pentru linie nouă)
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full text-sm bg-background border border-mid-gray/30 rounded-md px-3 py-2 text-text resize-none focus:outline-none focus:border-logo-primary/50"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Anulează
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
          >
            {submitting ? "Se salvează..." : "Salvează corecția"}
          </Button>
        </div>
      </div>
    </div>
  );
};
