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

  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.93, 0.86]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [32, 20]);
  const paddingY = useTransform(scrollYProgress, [0, 1], [20, 10]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 18]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["10%", "100%"]);
  const saturation = useTransform(scrollYProgress, [0, 1], [1.25, 1.05]);
  const shadowAlpha = useTransform(scrollYProgress, [0, 1], [0.35, 0.22]);

  const backdropFilter = useMotionTemplate`blur(${blur}px) saturate(${saturation})`;
  const shadow = useMotionTemplate`0 26px 80px rgba(20, 39, 79, ${shadowAlpha})`;

  return (
    <section ref={hostRef} className="relative h-[220px] sm:h-[255px]" aria-label="Kategoriövergång">
      <div className="section-shell sticky top-4 z-30">
        <motion.div
          style={{
            scale,
            y,
            borderRadius,
            paddingTop: paddingY,
            paddingBottom: paddingY,
            backdropFilter,
            boxShadow: shadow
          }}
          className="glass-elevated relative mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/[0.74] sm:text-xs">Category Morph</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/[0.62] sm:text-xs">Sticky aktiv</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            {CATEGORY_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                whileHover={{ y: -1.5, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5",
                  selected === option.value
                    ? "border-cyan-50/75 bg-cyan-50/[0.35] text-slate-900"
                    : "border-white/[0.26] bg-white/[0.17] text-white/[0.88] hover:border-white/[0.42] hover:bg-white/[0.22]"
                )}
                aria-pressed={selected === option.value}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 h-1.5 w-full rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-100 via-white to-sky-100"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
