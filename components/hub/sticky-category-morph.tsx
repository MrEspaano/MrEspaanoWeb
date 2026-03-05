"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
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

  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.95, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [34, 22]);
  const paddingY = useTransform(scrollYProgress, [0, 1], [24, 12]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 4]);

  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section ref={hostRef} className="relative mt-10 h-[208px] sm:mt-14 sm:h-[206px]" aria-label="Kategoriövergång">
      <div className="section-shell sticky top-5 z-30">
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Curated filters</p>
              <p className="mt-2 text-lg font-semibold text-slate-100 sm:text-xl">Växla fokus utan att bryta flödet</p>
            </div>
            <div className="glass-chip flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-slate-200">
              <Sparkles size={12} />
              Sticky toolbar
            </div>
          </div>

          <div className="mt-5 mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2.5">
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
                    ? "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,239,209,0.94),rgba(255,191,82,0.96)_34%,rgba(242,148,51,0.94))] text-slate-950 shadow-[0_16px_28px_rgba(255,149,38,0.22)]"
                    : "border-white/10 bg-slate-950/38 text-slate-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-slate-900/70"
                )}
                aria-pressed={selected === option.value}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/88">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-blue-400"
              animate={{
                width: `${((CATEGORY_OPTIONS.findIndex((option) => option.value === selected) + 1) / CATEGORY_OPTIONS.length) * 100}%`
              }}
              transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
