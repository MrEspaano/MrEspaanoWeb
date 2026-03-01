"use client";

import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

interface TextRevealSectionProps {
  text: string;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function TextRevealSection({ text }: TextRevealSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const words = text.split(" ");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"]
  });

  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const shine = useTransform(scrollYProgress, [0, 1], [0.8, 1.16]);
  const shineFilter = useMotionTemplate`brightness(${shine})`;

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return (
    <section ref={sectionRef} className="section-shell py-16 sm:py-20" aria-label="Text reveal">
      <div className="glass-elevated rounded-[2rem] p-6 sm:p-11">
        <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80 sm:text-xs sm:tracking-[0.28em]">Bonus moment</p>

        <motion.p className="mt-4 max-w-none text-[clamp(2rem,11vw,3.2rem)] font-semibold leading-[1.08] text-slate-500 sm:mt-5 sm:max-w-[24ch] sm:text-5xl lg:text-6xl">
          {words.map((word, index) => {
            const start = (index / words.length) * 0.8;
            const end = start + 0.22;
            const localProgress = clamp((progress - start) / (end - start));

            return (
              <span
                key={`${word}-${index}`}
                className="inline-block"
                style={{
                  opacity: 0.66 + localProgress * 0.34,
                  color: `rgba(226, 236, 255, ${0.42 + localProgress * 0.58})`,
                  transform: `translateY(${(1 - localProgress) * 8}px)`,
                  marginRight: "0.34em"
                }}
              >
                {word}
              </span>
            );
          })}
        </motion.p>

        <motion.div
          className="mt-8 h-[2px] rounded-full bg-gradient-to-r from-amber-400/90 via-orange-300/85 to-blue-400/75"
          style={{ clipPath: clip, filter: shineFilter }}
        />
      </div>
    </section>
  );
}
