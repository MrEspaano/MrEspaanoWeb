import { z } from "zod";
import { HubBodyFont, HubDesignConfig, HubDisplayFont, HubModuleConfig, HubModuleKey } from "@/lib/types";

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
    mediaBrightness: z.number().min(0.7).max(1.35)
  }),
  hero: z.object({
    maxWidth: z.number().min(620).max(1440),
    titleScale: z.number().min(0.7).max(1.4),
    bodyScale: z.number().min(0.7).max(1.3),
    ctaScale: z.number().min(0.7).max(1.3),
    opacity: z.number().min(0.2).max(1)
  }),
  modules: z.object({
    order: z.array(z.enum(MODULE_KEYS as [HubModuleKey, ...HubModuleKey[]])).min(4).max(4),
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

export const DEFAULT_HUB_DESIGN_CONFIG: HubDesignConfig = {
  global: {
    contentMaxWidth: 1280,
    bodyFont: "manrope",
    displayFont: "syne",
    mediaSaturation: 1.33,
    mediaContrast: 1.14,
    mediaBrightness: 1.07
  },
  hero: {
    maxWidth: 1024,
    titleScale: 1,
    bodyScale: 1,
    ctaScale: 1,
    opacity: 1
  },
  modules: {
    order: [...MODULE_KEYS],
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
  if (value === "space-grotesk" || value === "sora") {
    return value;
  }
  return "syne";
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
      mediaSaturation: clamp(Number(value.global?.mediaSaturation ?? 1.33), 0.7, 1.6),
      mediaContrast: clamp(Number(value.global?.mediaContrast ?? 1.14), 0.7, 1.5),
      mediaBrightness: clamp(Number(value.global?.mediaBrightness ?? 1.07), 0.7, 1.35)
    },
    hero: {
      maxWidth: clamp(Number(value.hero?.maxWidth ?? 1024), 620, 1440),
      titleScale: clamp(Number(value.hero?.titleScale ?? 1), 0.7, 1.4),
      bodyScale: clamp(Number(value.hero?.bodyScale ?? 1), 0.7, 1.3),
      ctaScale: clamp(Number(value.hero?.ctaScale ?? 1), 0.7, 1.3),
      opacity: clamp(Number(value.hero?.opacity ?? 1), 0.2, 1)
    },
    modules: {
      order: normalizeOrder(value.modules?.order),
      stickyCategoryMorph: normalizeModule(value.modules?.stickyCategoryMorph),
      featured: normalizeModule(value.modules?.featured),
      textReveal: normalizeModule(value.modules?.textReveal),
      storyFeed: normalizeModule(value.modules?.storyFeed)
    }
  };
}
