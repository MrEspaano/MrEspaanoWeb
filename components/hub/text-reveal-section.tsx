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
    offset: ["start 78%", "end 18%"]
  });

  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const shine = useTransform(scrollYProgress, [0, 1], [0.84, 1.18]);
  const shineFilter = useMotionTemplate`brightness(${shine})`;

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return (
    <section ref={sectionRef} className="section-shell py-16 sm:py-20" aria-label="Text reveal">
      <div className="glass-elevated overflow-hidden rounded-[2.2rem] p-6 sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Manifest</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-slate-100 sm:text-3xl">
              Rörelse som leder ögat, inte stjäl uppmärksamheten.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Textsektionen får en tydligare redaktionell roll med starkare typografi, mer rymd och en renare reveal.
            </p>

            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-950/34 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Reveal progress</p>
              <p className="mt-2 text-3xl font-semibold text-slate-100">{Math.round(progress * 100)}%</p>
            </div>
          </div>

          <div>
            <motion.p className="max-w-[18ch] text-[clamp(2.2rem,8vw,5.2rem)] font-semibold leading-[1.02] text-slate-500">
              {words.map((word, index) => {
                const start = (index / words.length) * 0.78;
                const end = start + 0.24;
                const localProgress = clamp((progress - start) / (end - start));

                return (
                  <span
                    key={`${word}-${index}`}
                    className="inline-block"
                    style={{
                      opacity: 0.34 + localProgress * 0.66,
                      color: `rgba(230, 238, 255, ${0.3 + localProgress * 0.7})`,
                      transform: `translateY(${(1 - localProgress) * 10}px)`,
                      marginRight: "0.32em"
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </motion.p>

            <motion.div
              className="mt-8 h-[3px] rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-blue-400"
              style={{ clipPath: clip, filter: shineFilter }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
