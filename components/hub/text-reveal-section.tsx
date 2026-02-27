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
  const shine = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const shineFilter = useMotionTemplate`brightness(${shine})`;

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return (
    <section ref={sectionRef} className="section-shell py-14 sm:py-20" aria-label="Text reveal">
      <div className="glass-panel rounded-3xl p-7 sm:p-12">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Bonus moment</p>

        <motion.p className="mt-6 text-2xl font-semibold leading-[1.25] text-white/28 sm:text-4xl lg:text-5xl">
          {words.map((word, index) => {
            const start = (index / words.length) * 0.85;
            const end = start + 0.23;
            const localProgress = clamp((progress - start) / (end - start));

            return (
              <span
                key={`${word}-${index}`}
                className="inline-block"
                style={{
                  opacity: 0.22 + localProgress * 0.78,
                  transform: `translateY(${(1 - localProgress) * 14}px)`
                }}
              >
                {word}
                {" "}
              </span>
            );
          })}
        </motion.p>

        <motion.div className="mt-8 h-[2px] rounded-full bg-gradient-to-r from-cyan-200/80 to-emerald-200/90" style={{ clipPath: clip, filter: shineFilter }} />
      </div>
    </section>
  );
}
