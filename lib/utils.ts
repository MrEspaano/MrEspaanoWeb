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
    return "bg-emerald-300/20 text-emerald-100 border-emerald-300/40";
  }

  if (status === "wip") {
    return "bg-amber-300/20 text-amber-100 border-amber-300/40";
  }

  return "bg-slate-400/20 text-slate-100 border-slate-300/40";
}
