import { z } from "zod";

const SETTINGS_TABS = ["general", "seo", "visibility", "information"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const settingsTabValidator = z
  .enum(SETTINGS_TABS)
  .default("general")
  .catch("general");
