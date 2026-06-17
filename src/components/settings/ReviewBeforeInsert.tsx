import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";

interface ReviewBeforeInsertProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const ReviewBeforeInsert: React.FC<ReviewBeforeInsertProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const enabled = getSetting("review_before_insert") ?? false;

    return (
      <ToggleSwitch
        checked={enabled}
        onChange={(value) => updateSetting("review_before_insert", value)}
        isUpdating={isUpdating("review_before_insert")}
        label={t("settings.reviewBeforeInsert.label")}
        description={t("settings.reviewBeforeInsert.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
      />
    );
  });
