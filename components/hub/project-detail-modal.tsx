"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Project } from "@/lib/types";
import { ProjectDetailSurface } from "@/components/hub/project-detail-surface";

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !project) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length < 2) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, project, onClose]);

  return (
    <AnimatePresence>
      {isOpen && project ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80]"
          aria-hidden={!isOpen}
        >
          <motion.button
            type="button"
            aria-label="Stäng projektmodal"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center justify-center p-4 sm:p-8">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={project.title}
              ref={panelRef}
              className="max-h-[92vh] w-full overflow-auto rounded-3xl"
            >
              <ProjectDetailSurface project={project} mode="modal" onClose={onClose} />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
