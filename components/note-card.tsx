"use client";

import { useEffect, useMemo, useState } from "react";
import { useDraggable, type DraggableAttributes } from "@dnd-kit/core";
import { NOTE_COLOR_CLASS, NOTE_COLOR_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { Note, NoteColor, NotePriority, NoteStatus } from "@/lib/types";

type DragListeners = ReturnType<typeof useDraggable>["listeners"];

interface NoteCardProps {
  note: Note;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DragListeners;
  isDragging?: boolean;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const statusOptions: NoteStatus[] = ["board", "todo", "doing", "done", "archived"];
const priorityOptions: NotePriority[] = ["high", "medium", "low"];

function toDatetimeInputValue(iso?: string) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toIsoDate(value: string) {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

export function NoteCard({ note, dragAttributes, dragListeners, isDragging, onUpdate, onDelete }: NoteCardProps) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [reminderValue, setReminderValue] = useState(toDatetimeInputValue(note.reminderAt));
  const [weeksText, setWeeksText] = useState(
    [...new Set([...(note.weekNumbers ?? []), ...(note.weekNumber ? [note.weekNumber] : [])])]
      .sort((a, b) => a - b)
      .join(",")
  );

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setReminderValue(toDatetimeInputValue(note.reminderAt));
    setWeeksText(
      [...new Set([...(note.weekNumbers ?? []), ...(note.weekNumber ? [note.weekNumber] : [])])]
        .sort((a, b) => a - b)
        .join(",")
    );
  }, [note.id, note.title, note.body, note.reminderAt, note.weekNumber, note.weekNumbers]);

  const parseWeeksText = (value: string) => {
    const weeks = value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((week) => Number.isInteger(week) && week >= 1 && week <= 53);
    return Array.from(new Set(weeks)).sort((a, b) => a - b);
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (title !== note.title || body !== note.body) {
        onUpdate(note.id, {
          title: title.trim() || "Ny lapp",
          body: body.trim()
        });
      }
    }, 300);

    return () => window.clearTimeout(id);
  }, [title, body, note.id, note.title, note.body, onUpdate]);

  const colorButtons = useMemo(() => {
    return (Object.keys(NOTE_COLOR_CLASS) as NoteColor[]).map((color) => (
      <button
        key={color}
        type="button"
        className={`h-5 w-5 rounded-full border border-board-border transition ${
          note.color === color ? "ring-2 ring-board-text" : ""
        } ${NOTE_COLOR_CLASS[color]}`}
        aria-label={`Färg ${NOTE_COLOR_LABELS[color]}`}
        onClick={() => onUpdate(note.id, { color })}
      />
    ));
  }, [note.color, note.id, onUpdate]);

  return (
    <article
      className={`w-full rounded-xl border border-board-border p-3 shadow-sm transition ${NOTE_COLOR_CLASS[note.color]} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {dragListeners ? (
          <button
            type="button"
            className="touch-none cursor-grab rounded-md border border-board-border px-2 py-1 text-xs text-board-muted active:cursor-grabbing"
            {...dragAttributes}
            {...dragListeners}
          >
            Dra
          </button>
        ) : (
          <div className="rounded-md border border-board-border px-2 py-1 text-xs text-board-muted">Lapp</div>
        )}
        <div className="flex items-center gap-2">{colorButtons}</div>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mb-2 w-full rounded-lg border border-board-border bg-white/50 px-2 py-1 text-sm font-semibold dark:bg-slate-900/40"
        placeholder="Titel"
        aria-label="Lapp-titel"
      />

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="mb-2 h-20 w-full resize-none rounded-lg border border-board-border bg-white/50 px-2 py-1 text-sm dark:bg-slate-900/40"
        placeholder="Innehåll"
        aria-label="Lapp-innehåll"
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <input
          value={note.classTag ?? ""}
          onChange={(event) => onUpdate(note.id, { classTag: event.target.value.toUpperCase() })}
          placeholder="Klass"
          className="rounded-md border border-board-border px-2 py-1"
          aria-label="Klass"
        />

        <select
          value={note.priority}
          onChange={(event) => onUpdate(note.id, { priority: event.target.value as NotePriority })}
          className="rounded-md border border-board-border px-2 py-1"
          aria-label="Prioritet"
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>

        <select
          value={note.status}
          onChange={(event) => onUpdate(note.id, { status: event.target.value as NoteStatus })}
          className="rounded-md border border-board-border px-2 py-1"
          aria-label="Status"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <input
          value={weeksText}
          onChange={(event) => setWeeksText(event.target.value)}
          onBlur={() => {
            const weekNumbers = parseWeeksText(weeksText);
            onUpdate(note.id, {
              weekNumbers,
              weekNumber: weekNumbers[0]
            });
            setWeeksText(weekNumbers.join(","));
          }}
          placeholder="Veckor ex 13,14"
          className="rounded-md border border-board-border px-2 py-1"
          aria-label="Veckor"
        />
      </div>

      <div className="mt-2">
        <input
          type="datetime-local"
          value={reminderValue}
          onChange={(event) => {
            setReminderValue(event.target.value);
            onUpdate(note.id, { reminderAt: toIsoDate(event.target.value) });
          }}
          className="w-full rounded-md border border-board-border px-2 py-1 text-xs"
          aria-label="Påminnelse"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() =>
            onUpdate(note.id, {
              status: note.status === "archived" ? "board" : "archived"
            })
          }
          className="rounded-md border border-board-border px-2 py-1 text-board-muted hover:text-board-text"
        >
          {note.status === "archived" ? "Återställ" : "Arkivera"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(note.id)}
          className="rounded-md border border-rose-300 px-2 py-1 text-rose-600"
        >
          Radera
        </button>
      </div>
    </article>
  );
}
