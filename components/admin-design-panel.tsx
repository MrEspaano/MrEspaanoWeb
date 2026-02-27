"use client";

import { FONT_FAMILY_LABELS, MODULE_IDS, MODULE_LABELS } from "@/lib/constants";
import type { AdminDesignState, BoardModuleId, ModuleDesignStyle } from "@/lib/types";

interface AdminDesignPanelProps {
  design: AdminDesignState;
  onToggleEnabled: (enabled: boolean) => void;
  onSelectModule: (moduleId: BoardModuleId) => void;
  onUpdateStyle: (moduleId: BoardModuleId, partial: Partial<ModuleDesignStyle>) => void;
  onResetModule: (moduleId: BoardModuleId) => void;
  onResetAll: () => void;
}

export function AdminDesignPanel({
  design,
  onToggleEnabled,
  onSelectModule,
  onUpdateStyle,
  onResetModule,
  onResetAll
}: AdminDesignPanelProps) {
  const currentModule = design.selectedModule;
  const currentStyle = design.modules[currentModule];

  return (
    <section className="rounded-xl2 border border-board-border bg-board-panel p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Admin: Designkontroller</h2>
          <p className="text-xs text-board-muted">Styr position, storlek, opacity och typsnitt per modul.</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleEnabled(!design.enabled)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            design.enabled ? "border-board-text text-board-text" : "border-board-border text-board-muted"
          }`}
        >
          {design.enabled ? "Designläge: På" : "Designläge: Av"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {MODULE_IDS.map((moduleId) => (
          <button
            key={moduleId}
            type="button"
            onClick={() => onSelectModule(moduleId)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              currentModule === moduleId
                ? "border-board-text bg-board-text text-board-bg"
                : "border-board-border text-board-muted hover:text-board-text"
            }`}
          >
            {MODULE_LABELS[moduleId]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="rounded-lg border border-board-border p-2 text-xs">
          Synlighet
          <div className="mt-2 flex items-center justify-between rounded-md border border-board-border px-3 py-2 text-sm">
            <span>{currentStyle.visible ? "Synlig" : "Dold"}</span>
            <input
              type="checkbox"
              checked={currentStyle.visible}
              onChange={(event) => onUpdateStyle(currentModule, { visible: event.target.checked })}
            />
          </div>
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          X-position: {currentStyle.offsetX}px
          <input
            type="range"
            min={-500}
            max={500}
            value={currentStyle.offsetX}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { offsetX: Number(event.target.value) })}
          />
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          Y-position: {currentStyle.offsetY}px
          <input
            type="range"
            min={-500}
            max={500}
            value={currentStyle.offsetY}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { offsetY: Number(event.target.value) })}
          />
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          Bredd: {currentStyle.widthPercent}%
          <input
            type="range"
            min={30}
            max={100}
            value={currentStyle.widthPercent}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { widthPercent: Number(event.target.value) })}
          />
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          Minhöjd: {currentStyle.minHeight}px
          <input
            type="range"
            min={0}
            max={900}
            step={10}
            value={currentStyle.minHeight}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { minHeight: Number(event.target.value) })}
          />
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          Opacity: {Math.round(currentStyle.opacity * 100)}%
          <input
            type="range"
            min={20}
            max={100}
            value={Math.round(currentStyle.opacity * 100)}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { opacity: Number(event.target.value) / 100 })}
          />
        </label>

        <label className="rounded-lg border border-board-border p-2 text-xs">
          Fontstorlek: {Math.round(currentStyle.fontScale * 100)}%
          <input
            type="range"
            min={70}
            max={160}
            value={Math.round(currentStyle.fontScale * 100)}
            className="mt-2 w-full"
            onChange={(event) => onUpdateStyle(currentModule, { fontScale: Number(event.target.value) / 100 })}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="rounded-lg border border-board-border p-2 text-xs">
          Fontfamilj
          <select
            className="mt-2 w-full rounded-md border border-board-border px-2 py-2 text-sm"
            value={currentStyle.fontFamily}
            onChange={(event) =>
              onUpdateStyle(currentModule, {
                fontFamily: event.target.value as ModuleDesignStyle["fontFamily"]
              })
            }
          >
            {Object.entries(FONT_FAMILY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onResetModule(currentModule)}
          className="rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted hover:text-board-text"
        >
          Återställ modul
        </button>
        <button
          type="button"
          onClick={onResetAll}
          className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-600"
        >
          Återställ allt
        </button>
      </div>
    </section>
  );
}
