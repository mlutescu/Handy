import React, { useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SettingContainer } from "../ui/SettingContainer";

const KNOWN_LANGUAGES: { code: string; label: string }[] = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

interface LangPromptsProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const LangPrompts: React.FC<LangPromptsProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { getSetting, updateSetting, isUpdating } = useSettings();
    const langPrompts: Record<string, string> =
      (getSetting("lang_prompts") as Record<string, string>) || {};

    const [selectedLang, setSelectedLang] = useState("ro");
    const [customLang, setCustomLang] = useState("");
    const [promptText, setPromptText] = useState("");

    const effectiveLang = selectedLang === "__custom__" ? customLang.trim().toLowerCase() : selectedLang;

    const handleSave = () => {
      if (!effectiveLang || !promptText.trim()) return;
      const updated = { ...langPrompts, [effectiveLang]: promptText.trim() };
      updateSetting("lang_prompts", updated as any);
      setPromptText("");
      if (selectedLang === "__custom__") setCustomLang("");
    };

    const handleRemove = (lang: string) => {
      const updated = { ...langPrompts };
      delete updated[lang];
      updateSetting("lang_prompts", updated as any);
    };

    const handleEdit = (lang: string) => {
      const known = KNOWN_LANGUAGES.find((l) => l.code === lang);
      if (known) {
        setSelectedLang(lang);
      } else {
        setSelectedLang("__custom__");
        setCustomLang(lang);
      }
      setPromptText(langPrompts[lang] || "");
    };

    const langLabel = (code: string) =>
      KNOWN_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();

    return (
      <>
        <SettingContainer
          title="Vocabulary per language"
          description="Custom vocabulary used as context when Whisper detects a specific language. Each language can have its own list of words or phrases."
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="text-sm bg-transparent border border-mid-gray/30 rounded px-2 py-1 text-white"
              >
                {KNOWN_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.code})
                  </option>
                ))}
                <option value="__custom__">Other…</option>
              </select>
              {selectedLang === "__custom__" && (
                <Input
                  type="text"
                  className="max-w-20"
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  placeholder="xx"
                  variant="compact"
                />
              )}
              <Input
                type="text"
                className="flex-1 min-w-40"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleSave(); }
                }}
                placeholder="word1, word2, phrase…"
                variant="compact"
                disabled={isUpdating("lang_prompts")}
              />
              <Button
                onClick={handleSave}
                disabled={!effectiveLang || !promptText.trim() || isUpdating("lang_prompts")}
                variant="primary"
                size="md"
              >
                Save
              </Button>
            </div>
          </div>
        </SettingContainer>

        {Object.keys(langPrompts).length > 0 && (
          <div
            className={`px-4 p-2 ${grouped ? "" : "rounded-lg border border-mid-gray/20"} flex flex-col gap-2`}
          >
            {Object.entries(langPrompts).map(([lang, prompt]) => (
              <div
                key={lang}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-blue-400 shrink-0">
                    {langLabel(lang)}
                  </span>
                  <span className="text-white/60 truncate">{prompt}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    onClick={() => handleEdit(lang)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleRemove(lang)}
                    disabled={isUpdating("lang_prompts")}
                    variant="secondary"
                    size="sm"
                    className="text-red-400"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  },
);
