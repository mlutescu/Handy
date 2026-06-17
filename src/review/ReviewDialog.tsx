import { listen } from "@tauri-apps/api/event";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { commands } from "@/bindings";
import "./ReviewDialog.css";

interface ReviewPayload {
  original_text: string;
  processed_text: string;
}

const ReviewDialog: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const originalTextRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const setup = async () => {
      const unlisten = await listen<ReviewPayload>(
        "transcription-review",
        (event) => {
          const { original_text, processed_text } = event.payload;
          originalTextRef.current = original_text;
          setText(processed_text);
          setVisible(true);
          // Focus the textarea on next tick so the window is already visible
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.select();
            }
          }, 50);
        },
      );
      return unlisten;
    };

    let cleanupFn: (() => void) | undefined;
    setup().then((fn) => {
      cleanupFn = fn;
    });
    return () => {
      cleanupFn?.();
    };
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!visible) return;
    setVisible(false);
    await commands.confirmTranscription(originalTextRef.current, text);
  }, [text, visible]);

  const handleCancel = useCallback(async () => {
    if (!visible) return;
    setVisible(false);
    await commands.cancelTranscription();
  }, [visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
      // Ctrl+Enter or Cmd+Enter confirms without newline
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, handleConfirm, handleCancel]);

  if (!visible) return null;

  return (
    <div className="review-backdrop" onClick={(e) => e.stopPropagation()}>
      <div className="review-dialog">
        <div className="review-header">
          <span className="review-title">Review transcription</span>
          <span className="review-hint">⌘↵ insert · Esc cancel</span>
        </div>

        <textarea
          ref={textareaRef}
          className="review-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck
          autoFocus
        />

        <div className="review-footer">
          <button className="review-btn cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="review-btn confirm" onClick={handleConfirm}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDialog;
