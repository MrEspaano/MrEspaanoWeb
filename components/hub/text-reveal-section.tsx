"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform
} from "framer-motion";
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
  const shine = useTransform(scrollYProgress, [0, 1], [0.55, 1]);
  const shineFilter = useMotionTemplate`brightness(${shine})`;

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return (
    <section ref={sectionRef} className="section-shell py-16 sm:py-20" aria-label="Text reveal">
      <div className="glass-elevated rounded-[2rem] p-7 sm:p-11">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-700/75">Bonus moment</p>

        <motion.p className="mt-5 max-w-[24ch] text-3xl font-semibold leading-[1.18] text-slate-900/42 sm:text-5xl lg:text-6xl">
          {words.map((word, index) => {
            const start = (index / words.length) * 0.82;
            const end = start + 0.2;
            const localProgress = clamp((progress - start) / (end - start));

            return (
              <span
                key={`${word}-${index}`}
                className="inline-block"
                style={{
                  opacity: 0.42 + localProgress * 0.58,
                  transform: `translateY(${(1 - localProgress) * 12}px)`,
                  marginRight: "0.34em"
                }}
              >
                {word}
              </span>
            );
          })}
        </motion.p>

        <motion.div
          className="mt-8 h-[2px] rounded-full bg-gradient-to-r from-sky-400/80 via-sky-300/70 to-blue-300/65"
          style={{ clipPath: clip, filter: shineFilter }}
        />
      </div>
    </section>
  );
}
