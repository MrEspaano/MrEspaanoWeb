"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ProjectCategoryFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StickyCategoryMorphProps {
  selected: ProjectCategoryFilter;
  onSelect: (category: ProjectCategoryFilter) => void;
}

const CATEGORY_OPTIONS: { value: ProjectCategoryFilter; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "app", label: CATEGORY_LABELS.app },
  { value: "game", label: CATEGORY_LABELS.game },
  { value: "site", label: CATEGORY_LABELS.site }
];

export function StickyCategoryMorph({ selected, onSelect }: StickyCategoryMorphProps) {
  const hostRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.88, 0.78]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [30, 18]);
  const paddingY = useTransform(scrollYProgress, [0, 1], [18, 10]);
  const blur = useTransform(scrollYProgress, [0, 1], [4, 12]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["8%", "100%"]);
  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section ref={hostRef} className="relative h-[220px] sm:h-[260px]" aria-label="Kategoriövergång">
      <div className="section-shell sticky top-4 z-30">
        <motion.div
          style={{
            scale,
            y,
            borderRadius,
            paddingTop: paddingY,
            paddingBottom: paddingY,
            backdropFilter
          }}
          className="relative mx-auto max-w-5xl border border-white/15 bg-white/10 px-4 shadow-glass sm:px-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/70 sm:text-xs">Category Morph</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/55 sm:text-xs">Sticky aktiv</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5",
                  selected === option.value
                    ? "border-cyan-200/70 bg-cyan-200/20 text-cyan-50"
                    : "border-white/15 bg-white/6 text-white/75 hover:border-white/30 hover:bg-white/10"
                )}
                aria-pressed={selected === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-white to-emerald-200"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
