"use client";

import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { BoardFilters, NotePriority, NoteStatus } from "@/lib/types";

interface FilterBarProps {
  filters: BoardFilters;
  classTags: string[];
  currentWeek: number;
  onChange: (partial: Partial<BoardFilters>) => void;
  onReset: () => void;
}

const priorityOptions: Array<NotePriority | "all"> = ["all", "high", "medium", "low"];
const statusOptions: Array<NoteStatus | "all"> = ["all", "board", "todo", "doing", "done", "archived"];

export function FilterBar({ filters, classTags, currentWeek, onChange, onReset }: FilterBarProps) {
  return (
    <section className="rounded-xl2 border border-board-border bg-board-panel p-3 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.classTag ?? ""}
          onChange={(event) => onChange({ classTag: event.target.value || null })}
          className="rounded-lg border border-board-border px-3 py-2 text-sm"
          aria-label="Filter klass"
        >
          <option value="">Alla klasser</option>
          {classTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value as NotePriority | "all" })}
          className="rounded-lg border border-board-border px-3 py-2 text-sm"
          aria-label="Filter prioritet"
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority === "all" ? "Alla prioriteringar" : PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as NoteStatus | "all" })}
          className="rounded-lg border border-board-border px-3 py-2 text-sm"
          aria-label="Filter status"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "Alla statusar" : STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.weekNumber ?? ""}
          onChange={(event) => {
            const value = Number(event.target.value);
            onChange({ weekNumber: Number.isNaN(value) ? null : value || null });
          }}
          className="rounded-lg border border-board-border px-3 py-2 text-sm"
          aria-label="Filter vecka"
        >
          <option value="">Alla veckor</option>
          {Array.from({ length: 52 }, (_, index) => index + 1).map((weekNumber) => (
            <option key={weekNumber} value={weekNumber}>
              v{weekNumber}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted">
          <input
            type="checkbox"
            checked={filters.onlyCurrentWeek}
            onChange={(event) => onChange({ onlyCurrentWeek: event.target.checked })}
          />
          Endast vecka {currentWeek}
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted">
          <input
            type="checkbox"
            checked={filters.includeArchived}
            onChange={(event) => onChange({ includeArchived: event.target.checked })}
          />
          Inkludera arkiv
        </label>

        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted hover:text-board-text"
        >
          Nollställ filter
        </button>
      </div>
    </section>
  );
}
