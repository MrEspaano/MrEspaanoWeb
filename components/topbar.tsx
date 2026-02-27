"use client";

import { useRef } from "react";
import type { BoardMode, ThemeMode } from "@/lib/types";

interface TopBarProps {
  mode: BoardMode;
  search: string;
  theme: ThemeMode;
  isAdminPanelOpen: boolean;
  onModeChange: (mode: BoardMode) => void;
  onSearchChange: (value: string) => void;
  onNewNote: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onToggleTheme: () => void;
  onToggleAdminPanel: () => void;
}

const MODE_OPTIONS: Array<{ id: BoardMode; label: string }> = [
  { id: "free", label: "Fri tavla" },
  { id: "columns", label: "Kolumner" },
  { id: "class", label: "Klassvy" }
];

export function TopBar({
  mode,
  search,
  theme,
  isAdminPanelOpen,
  onModeChange,
  onSearchChange,
  onNewNote,
  onExport,
  onImport,
  onToggleTheme,
  onToggleAdminPanel
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-2 z-40 rounded-xl2 border border-board-border bg-board-panel/95 px-4 py-3 shadow-card backdrop-blur sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold leading-tight">BoardFlow</h1>
          <p className="text-xs text-board-muted">Digital anslagstavla för lärare</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-board-border bg-board-bg p-1">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onModeChange(option.id)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                mode === option.id ? "bg-board-text text-board-bg" : "text-board-muted hover:text-board-text"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Sök titel eller innehåll..."
          className="min-w-52 flex-1 rounded-lg border border-board-border bg-board-panel px-3 py-2 text-sm"
          aria-label="Sök lappar"
        />

        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted hover:text-board-text"
        >
          {theme === "dark" ? "Mörk" : theme === "light" ? "Ljus" : "System"}
        </button>

        <button
          type="button"
          onClick={onToggleAdminPanel}
          className={`rounded-lg border px-3 py-2 text-sm ${
            isAdminPanelOpen ? "border-board-text text-board-text" : "border-board-border text-board-muted"
          }`}
        >
          Adminpanel
        </button>

        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-board-border px-3 py-2 text-sm hover:border-board-text"
        >
          Export
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-board-border px-3 py-2 text-sm hover:border-board-text"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              onImport(selected);
            }
            event.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={onNewNote}
          className="rounded-lg bg-board-text px-4 py-2 text-sm font-semibold text-board-bg"
        >
          Ny lapp
        </button>
      </div>
    </header>
  );
}
