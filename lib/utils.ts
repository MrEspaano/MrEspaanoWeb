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
    return "border-emerald-300/80 bg-emerald-100/80 text-emerald-800";
  }

  if (status === "wip") {
    return "border-amber-300/80 bg-amber-100/80 text-amber-800";
  }

  return "border-slate-300/80 bg-slate-100/85 text-slate-700";
}
