import React, { useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SettingContainer } from "../ui/SettingContainer";

const COMMON_LANGUAGES: { code: string; label: string }[] = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

interface AllowedLanguagesProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const AllowedLanguages: React.FC<AllowedLanguagesProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { getSetting, updateSetting, isUpdating } = useSettings();
    const allowed: string[] =
      (getSetting("allowed_languages") as string[]) ?? [];

    const [customCode, setCustomCode] = useState("");

    const toggle = (code: string) => {
      const next = allowed.includes(code)
        ? allowed.filter((l) => l !== code)
        : [...allowed, code];
      updateSetting("allowed_languages", next as any);
    };

    const addCustom = () => {
      const code = customCode.trim().toLowerCase();
      if (!code || allowed.includes(code)) return;
      updateSetting("allowed_languages", [...allowed, code] as any);
      setCustomCode("");
    };

    const isChecked = (code: string) => allowed.includes(code);
    const isCustom = (code: string) =>
      !COMMON_LANGUAGES.some((l) => l.code === code);

    const customCodes = allowed.filter(isCustom);

    return (
      <SettingContainer
        title="Allowed detection languages"
        description="Restrict Whisper's automatic language detection to only these languages. When audio in another language is detected, Whisper will fall back to the highest-probability allowed language. Leave all unchecked to allow any language."
        descriptionMode={descriptionMode}
        grouped={grouped}
      >
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => toggle(l.code)}
                disabled={isUpdating("allowed_languages")}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  isChecked(l.code)
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-mid-gray/30 bg-transparent text-white/50 hover:text-white/80"
                }`}
              >
                {l.label} <span className="opacity-60">({l.code})</span>
              </button>
            ))}
            {customCodes.map((code) => (
              <button
                key={code}
                onClick={() => toggle(code)}
                disabled={isUpdating("allowed_languages")}
                className="text-xs px-2 py-1 rounded border border-blue-500 bg-blue-500/20 text-blue-300 transition-colors"
              >
                {code.toUpperCase()}{" "}
                <span className="opacity-60 text-red-400">✕</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              className="max-w-28"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="xx"
              variant="compact"
              disabled={isUpdating("allowed_languages")}
            />
            <Button
              onClick={addCustom}
              disabled={
                !customCode.trim() ||
                allowed.includes(customCode.trim().toLowerCase()) ||
                isUpdating("allowed_languages")
              }
              variant="secondary"
              size="md"
            >
              Add language
            </Button>
          </div>

          {allowed.length === 0 && (
            <p className="text-xs text-white/40 italic">
              No restriction — Whisper may detect any language.
            </p>
          )}
        </div>
      </SettingContainer>
    );
  },
);
