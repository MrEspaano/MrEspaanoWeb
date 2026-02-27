"use client";

import type { CSSProperties, ReactNode } from "react";
import { FONT_FAMILY_STACKS, MODULE_LABELS } from "@/lib/constants";
import type { AdminDesignState, BoardModuleId } from "@/lib/types";

interface DesignModuleShellProps {
  moduleId: BoardModuleId;
  design: AdminDesignState;
  canEdit?: boolean;
  className?: string;
  children: ReactNode;
  onSelectModule: (moduleId: BoardModuleId) => void;
}

export function DesignModuleShell({
  moduleId,
  design,
  canEdit = false,
  className,
  children,
  onSelectModule
}: DesignModuleShellProps) {
  const moduleStyle = design.modules[moduleId];
  const isSelected = design.enabled && canEdit && design.selectedModule === moduleId;

  const style: CSSProperties = {
    width: `${moduleStyle.widthPercent}%`,
    minHeight: moduleStyle.minHeight > 0 ? `${moduleStyle.minHeight}px` : undefined,
    opacity: moduleStyle.opacity,
    fontSize: `${Math.round(moduleStyle.fontScale * 100)}%`,
    fontFamily: FONT_FAMILY_STACKS[moduleStyle.fontFamily],
    transform:
      moduleStyle.offsetX !== 0 || moduleStyle.offsetY !== 0
        ? `translate(${moduleStyle.offsetX}px, ${moduleStyle.offsetY}px)`
        : undefined,
    transformOrigin: "top left"
  };

  return (
    <section
      style={style}
      className={`${className ?? ""} relative transition`}
      onClick={() => {
        if (design.enabled && canEdit) {
          onSelectModule(moduleId);
        }
      }}
    >
      {design.enabled && canEdit ? (
        <div
          className={`pointer-events-none absolute left-2 top-2 z-50 rounded-md border px-2 py-1 text-[11px] font-semibold ${
            isSelected
              ? "border-board-text bg-board-text text-board-bg"
              : "border-board-border bg-board-panel/95 text-board-muted"
          }`}
        >
          {MODULE_LABELS[moduleId]}
        </div>
      ) : null}
      {design.enabled && canEdit ? (
        <div
          className={`absolute inset-0 z-40 rounded-xl2 border-2 border-dashed ${
            isSelected ? "border-board-text/70" : "border-board-border/60"
          } pointer-events-none`}
        />
      ) : null}
      {children}
    </section>
  );
}
