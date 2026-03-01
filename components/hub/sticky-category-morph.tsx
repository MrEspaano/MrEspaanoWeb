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

  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.94, 0.88]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [30, 18]);
  const paddingY = useTransform(scrollYProgress, [0, 1], [20, 10]);
  const blur = useTransform(scrollYProgress, [0, 1], [3, 1]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["8%", "100%"]);

  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section ref={hostRef} className="relative mt-10 h-[194px] sm:mt-12 sm:h-[190px]" aria-label="Kategoriövergång">
      <div className="section-shell sticky top-6 z-30">
        <motion.div
          style={{
            scale,
            y,
            borderRadius,
            paddingTop: paddingY,
            paddingBottom: paddingY,
            backdropFilter
          }}
          className="glass-elevated relative mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="mb-3 flex items-center justify-between gap-4 sm:mb-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-blue-200/70 sm:text-xs sm:tracking-[0.26em]">Filtrera projekt</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:text-xs sm:tracking-[0.26em]">Sticky toolbar</p>
          </div>

          <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5",
                  selected === option.value
                    ? "border-amber-200/75 bg-amber-400/90 text-slate-900"
                    : "border-slate-600/85 bg-slate-900/85 text-slate-200 hover:-translate-y-0.5 hover:border-slate-400/90 hover:bg-slate-800/95"
                )}
                aria-pressed={selected === option.value}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 h-1.5 w-full rounded-full bg-slate-700/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400/90 via-orange-400/85 to-blue-400/85"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
