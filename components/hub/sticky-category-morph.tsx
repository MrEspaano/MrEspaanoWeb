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
  const blur = useTransform(scrollYProgress, [0, 1], [7, 12]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["10%", "100%"]);
  const saturation = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const shadowAlpha = useTransform(scrollYProgress, [0, 1], [0.2, 0.14]);

  const backdropFilter = useMotionTemplate`blur(${blur}px) saturate(${saturation})`;
  const shadow = useMotionTemplate`0 26px 80px rgba(20, 39, 79, ${shadowAlpha})`;

  return (
    <section ref={hostRef} className="relative mt-10 h-[170px] sm:mt-12 sm:h-[190px]" aria-label="Kategoriövergång">
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
          className="glass-elevated relative mx-auto max-w-4xl px-4 sm:px-6"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-sky-700/70 sm:text-xs">Filtrera projekt</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500/80 sm:text-xs">Sticky</p>
          </div>

          <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
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
                    ? "border-sky-300/85 bg-sky-200/72 text-slate-900"
                    : "border-sky-100/80 bg-white/74 text-slate-700 hover:-translate-y-0.5 hover:border-sky-200/90 hover:bg-white/90"
                )}
                aria-pressed={selected === option.value}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-3 h-1.5 w-full rounded-full bg-sky-200/55">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400/75 via-sky-300/85 to-blue-300/75"
              style={{ width: progressWidth }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
