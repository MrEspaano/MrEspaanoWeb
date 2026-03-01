import { z } from "zod";
import {
  HubBodyFont,
  HubDesignConfig,
  HubDisplayFont,
  HubModuleConfig,
  HubModuleKey,
  HubMotionPreset,
  HubThemeMode
} from "@/lib/types";

const MODULE_KEYS: HubModuleKey[] = ["stickyCategoryMorph", "featured", "textReveal", "storyFeed"];

const moduleSchema = z.object({
  visible: z.boolean(),
  opacity: z.number().min(0.15).max(1),
  scale: z.number().min(0.75).max(1.25),
  yOffset: z.number().min(-180).max(180)
});

export const hubDesignConfigSchema = z.object({
  global: z.object({
    contentMaxWidth: z.number().min(960).max(1560),
    bodyFont: z.enum(["manrope", "inter", "system"]),
    displayFont: z.enum(["syne", "space-grotesk", "sora"]),
    mediaSaturation: z.number().min(0.7).max(1.6),
    mediaContrast: z.number().min(0.7).max(1.5),
    mediaBrightness: z.number().min(0.7).max(1.35),
    themeMode: z.enum(["dark-editorial", "dark-neon", "hybrid"]),
    accentStrength: z.number().min(0.6).max(1.6),
    panelContrast: z.number().min(0.7).max(1.5),
    motionPreset: z.enum(["balanced", "high-energy", "minimal"])
  }),
  hero: z.object({
    maxWidth: z.number().min(620).max(1440),
    titleScale: z.number().min(0.7).max(1.4),
    titleMaxWidth: z.number().min(360).max(1400),
    titleLineHeight: z.number().min(0.8).max(1.4),
    bodyScale: z.number().min(0.7).max(1.3),
    bodyMaxWidth: z.number().min(320).max(1280),
    bodyLineHeight: z.number().min(1.1).max(2.2),
    ctaScale: z.number().min(0.7).max(1.3),
    opacity: z.number().min(0.2).max(1),
    logoOffsetX: z.number().min(-220).max(220),
    logoOffsetY: z.number().min(-220).max(220),
    logoScale: z.number().min(0.5).max(1.6)
  }),
  modules: z.object({
    order: z.array(z.enum(MODULE_KEYS as [HubModuleKey, ...HubModuleKey[]])).min(4).max(4),
    textRevealCopy: z.string().min(20).max(400),
    stickyCategoryMorph: moduleSchema,
    featured: moduleSchema,
    textReveal: moduleSchema,
    storyFeed: moduleSchema
  })
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const defaultModule: HubModuleConfig = {
  visible: true,
  opacity: 1,
  scale: 1,
  yOffset: 0
};

const DEFAULT_TEXT_REVEAL_COPY =
  "Varje projekt ska kännas som en story: tydlig riktning, precision i detaljer och rörelse som guidar upplevelsen istället för att distrahera.";

export const DEFAULT_HUB_DESIGN_CONFIG: HubDesignConfig = {
  global: {
    contentMaxWidth: 1280,
    bodyFont: "manrope",
    displayFont: "sora",
    mediaSaturation: 1.22,
    mediaContrast: 1.17,
    mediaBrightness: 1.06,
    themeMode: "dark-editorial",
    accentStrength: 1,
    panelContrast: 1,
    motionPreset: "high-energy"
  },
  hero: {
    maxWidth: 1320,
    titleScale: 1,
    titleMaxWidth: 980,
    titleLineHeight: 0.99,
    bodyScale: 1,
    bodyMaxWidth: 860,
    bodyLineHeight: 1.7,
    ctaScale: 1,
    opacity: 1,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoScale: 1
  },
  modules: {
    order: [...MODULE_KEYS],
    textRevealCopy: DEFAULT_TEXT_REVEAL_COPY,
    stickyCategoryMorph: { ...defaultModule },
    featured: { ...defaultModule },
    textReveal: { ...defaultModule },
    storyFeed: { ...defaultModule }
  }
};

function parseBodyFont(value: unknown): HubBodyFont {
  if (value === "inter" || value === "system") {
    return value;
  }
  return "manrope";
}

function parseDisplayFont(value: unknown): HubDisplayFont {
  if (value === "syne" || value === "space-grotesk" || value === "sora") {
    return value;
  }
  return "sora";
}

function parseThemeMode(value: unknown): HubThemeMode {
  if (value === "dark-neon" || value === "hybrid") {
    return value;
  }
  return "dark-editorial";
}

function parseMotionPreset(value: unknown): HubMotionPreset {
  if (value === "balanced" || value === "minimal") {
    return value;
  }
  return "high-energy";
}

function normalizeModule(raw: unknown): HubModuleConfig {
  const value = (raw ?? {}) as Partial<HubModuleConfig>;
  return {
    visible: value.visible ?? true,
    opacity: clamp(Number(value.opacity ?? 1), 0.15, 1),
    scale: clamp(Number(value.scale ?? 1), 0.75, 1.25),
    yOffset: clamp(Number(value.yOffset ?? 0), -180, 180)
  };
}

function normalizeOrder(raw: unknown): HubModuleKey[] {
  const values = Array.isArray(raw) ? raw : [];
  const valid = values.filter((value): value is HubModuleKey => MODULE_KEYS.includes(value as HubModuleKey));
  const merged = [...valid];
  MODULE_KEYS.forEach((key) => {
    if (!merged.includes(key)) {
      merged.push(key);
    }
  });
  return merged.slice(0, MODULE_KEYS.length);
}

export function normalizeHubDesignConfig(raw: unknown): HubDesignConfig {
  const value = (raw ?? {}) as Partial<HubDesignConfig>;
  return {
    global: {
      contentMaxWidth: clamp(Number(value.global?.contentMaxWidth ?? 1280), 960, 1560),
      bodyFont: parseBodyFont(value.global?.bodyFont),
      displayFont: parseDisplayFont(value.global?.displayFont),
      mediaSaturation: clamp(Number(value.global?.mediaSaturation ?? 1.22), 0.7, 1.6),
      mediaContrast: clamp(Number(value.global?.mediaContrast ?? 1.17), 0.7, 1.5),
      mediaBrightness: clamp(Number(value.global?.mediaBrightness ?? 1.06), 0.7, 1.35),
      themeMode: parseThemeMode(value.global?.themeMode),
      accentStrength: clamp(Number(value.global?.accentStrength ?? 1), 0.6, 1.6),
      panelContrast: clamp(Number(value.global?.panelContrast ?? 1), 0.7, 1.5),
      motionPreset: parseMotionPreset(value.global?.motionPreset)
    },
    hero: {
      maxWidth: clamp(Number(value.hero?.maxWidth ?? 1320), 620, 1440),
      titleScale: clamp(Number(value.hero?.titleScale ?? 1), 0.7, 1.4),
      titleMaxWidth: clamp(Number(value.hero?.titleMaxWidth ?? 980), 360, 1400),
      titleLineHeight: clamp(Number(value.hero?.titleLineHeight ?? 0.99), 0.8, 1.4),
      bodyScale: clamp(Number(value.hero?.bodyScale ?? 1), 0.7, 1.3),
      bodyMaxWidth: clamp(Number(value.hero?.bodyMaxWidth ?? 860), 320, 1280),
      bodyLineHeight: clamp(Number(value.hero?.bodyLineHeight ?? 1.7), 1.1, 2.2),
      ctaScale: clamp(Number(value.hero?.ctaScale ?? 1), 0.7, 1.3),
      opacity: clamp(Number(value.hero?.opacity ?? 1), 0.2, 1),
      logoOffsetX: clamp(Number(value.hero?.logoOffsetX ?? 0), -220, 220),
      logoOffsetY: clamp(Number(value.hero?.logoOffsetY ?? 0), -220, 220),
      logoScale: clamp(Number(value.hero?.logoScale ?? 1), 0.5, 1.6)
    },
    modules: {
      order: normalizeOrder(value.modules?.order),
      textRevealCopy:
        typeof value.modules?.textRevealCopy === "string" && value.modules.textRevealCopy.trim().length >= 20
          ? value.modules.textRevealCopy.trim().slice(0, 400)
          : DEFAULT_TEXT_REVEAL_COPY,
      stickyCategoryMorph: normalizeModule(value.modules?.stickyCategoryMorph),
      featured: normalizeModule(value.modules?.featured),
      textReveal: normalizeModule(value.modules?.textReveal),
      storyFeed: normalizeModule(value.modules?.storyFeed)
    }
  };
}
