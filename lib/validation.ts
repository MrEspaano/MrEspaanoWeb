import { z } from "zod";
import { hubDesignConfigSchema } from "@/lib/design-config";

export const projectLinksSchema = z.object({
  demoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  caseStudyUrl: z.string().url().optional()
});

export const projectVisualsSchema = z.object({
  coverPath: z.string().min(1).optional(),
  galleryPaths: z.array(z.string().min(1)).optional()
});

export const projectFormSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug måste innehålla minst 2 tecken")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla små bokstäver, siffror och bindestreck"),
  title: z.string().min(2, "Titel är obligatorisk").max(120),
  shortDescription: z.string().min(10, "Kort beskrivning måste vara minst 10 tecken").max(280),
  longDescription: z.string().min(30, "Lång beskrivning måste vara minst 30 tecken").max(4000),
  category: z.enum(["app", "game", "site"]),
  status: z.enum(["live", "wip", "archived"]),
  tags: z.array(z.string().min(1)).max(20),
  techStack: z.array(z.string().min(1)).max(30),
  links: projectLinksSchema
});

export const settingsFormSchema = z.object({
  displayName: z.string().min(2).max(100),
  tagline: z.string().min(10).max(180),
  bio: z.string().min(20).max(1200),
  heroCtaPrimary: z.string().min(2).max(80),
  heroCtaSecondary: z.string().min(2).max(80),
  designConfig: hubDesignConfigSchema,
  socialLinks: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    x: z.string().url().optional(),
    email: z.string().email().optional()
  })
});
