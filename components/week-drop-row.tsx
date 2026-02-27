"use client";

import { useEffect, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getCurrentWeekNumber } from "@/lib/date";

interface WeekDropChipProps {
  weekNumber: number;
  selectedWeek: number | null;
  onSelect: (weekNumber: number | null) => void;
}

function WeekDropChip({ weekNumber, selectedWeek, onSelect }: WeekDropChipProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `week-${weekNumber}`
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onSelect(selectedWeek === weekNumber ? null : weekNumber)}
      className={`shrink-0 rounded-lg border px-3 py-2 text-sm transition ${
        isOver
          ? "border-board-text bg-board-text text-board-bg"
          : selectedWeek === weekNumber
            ? "border-board-text text-board-text"
            : "border-board-border text-board-muted hover:text-board-text"
      }`}
    >
      v{weekNumber}
    </button>
  );
}

interface WeekDropRowProps {
  selectedWeek: number | null;
  onSelectWeek: (weekNumber: number | null) => void;
}

export function WeekDropRow({ selectedWeek, onSelectWeek }: WeekDropRowProps) {
  const allWeeks = useMemo(() => Array.from({ length: 52 }, (_, index) => index + 1), []);
  const pageSize = 8;
  const [pageStart, setPageStart] = useState(() => {
    const currentWeek = getCurrentWeekNumber();
    return Math.floor((currentWeek - 1) / pageSize) * pageSize;
  });

  useEffect(() => {
    if (!selectedWeek) {
      return;
    }
    const targetStart = Math.floor((selectedWeek - 1) / pageSize) * pageSize;
    if (targetStart !== pageStart) {
      setPageStart(targetStart);
    }
  }, [selectedWeek, pageStart]);

  const pageEnd = Math.min(pageStart + pageSize, allWeeks.length);
  const visibleWeeks = allWeeks.slice(pageStart, pageEnd);

  return (
    <section className="w-full overflow-hidden rounded-xl2 border border-board-border bg-board-panel p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-board-muted">Dra lapp hit för att sätta vecka</p>
        <p className="text-xs text-board-muted">
          v{visibleWeeks[0]}-v{visibleWeeks[visibleWeeks.length - 1]}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPageStart((start) => Math.max(0, start - pageSize))}
          disabled={pageStart === 0}
          className="rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted disabled:opacity-40"
        >
          ←
        </button>
        <div className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto pb-1">
          {visibleWeeks.map((weekNumber) => (
            <WeekDropChip
              key={weekNumber}
              weekNumber={weekNumber}
              selectedWeek={selectedWeek}
              onSelect={onSelectWeek}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPageStart((start) => Math.min(52 - pageSize, start + pageSize))}
          disabled={pageEnd >= 52}
          className="rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted disabled:opacity-40"
        >
          →
        </button>
      </div>
    </section>
  );
}
