import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function csvToArray(input: string | null | undefined) {
  if (!input) {
    return [];
  }

  return input
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function toOptionalUrl(input: string | null | undefined) {
  const value = input?.trim();
  return value ? value : undefined;
}

export function mapStatusBadgeClass(status: "live" | "wip" | "archived") {
  if (status === "live") {
    return "badge-status border-emerald-300/55 bg-emerald-500/18 text-emerald-200";
  }

  if (status === "wip") {
    return "badge-status border-amber-300/55 bg-amber-500/18 text-amber-200";
  }

  return "badge-status border-slate-400/45 bg-slate-500/20 text-slate-300";
}
