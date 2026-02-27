"use client";

import { FormEvent, useEffect, useState } from "react";
import { NOTE_COLOR_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import type { NoteColor, NotePriority } from "@/lib/types";

interface NewNoteModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: {
    title?: string;
    body?: string;
    color?: NoteColor;
    classTag?: string;
    priority?: NotePriority;
  }) => void;
  onQuickCreate: (input: string) => void;
}

const colors = Object.keys(NOTE_COLOR_LABELS) as NoteColor[];
const priorities: NotePriority[] = ["high", "medium", "low"];

export function NewNoteModal({ open, onClose, onCreate, onQuickCreate }: NewNoteModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [classTag, setClassTag] = useState("");
  const [color, setColor] = useState<NoteColor>("blue");
  const [priority, setPriority] = useState<NotePriority>("medium");
  const [quickInput, setQuickInput] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reset = () => {
    setTitle("");
    setBody("");
    setClassTag("");
    setColor("blue");
    setPriority("medium");
    setQuickInput("");
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    onCreate({
      title,
      body,
      classTag: classTag || undefined,
      color,
      priority
    });
    reset();
    onClose();
  };

  const submitQuickInput = () => {
    if (!quickInput.trim()) {
      return;
    }
    onQuickCreate(quickInput);
    reset();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-xl2 border border-board-border bg-board-panel p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ny lapp</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-board-border px-2 py-1 text-sm">
            Stäng
          </button>
        </div>

        <div className="rounded-lg border border-board-border bg-board-bg p-3">
          <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-board-muted">Snabbinput</label>
          <div className="flex gap-2">
            <input
              value={quickInput}
              onChange={(event) => setQuickInput(event.target.value)}
              placeholder='Ex: "8B prov 12/3 boka sal hög"'
              className="flex-1 rounded-lg border border-board-border px-3 py-2 text-sm"
              aria-label="Snabbinput"
            />
            <button
              type="button"
              onClick={submitQuickInput}
              className="rounded-lg bg-board-text px-3 py-2 text-sm font-semibold text-board-bg"
            >
              Tolka
            </button>
          </div>
        </div>

        <form onSubmit={submitForm} className="mt-4 space-y-3">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-board-border px-3 py-2"
            placeholder="Titel"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="h-24 w-full rounded-lg border border-board-border px-3 py-2"
            placeholder="Innehåll"
          />

          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={classTag}
              onChange={(event) => setClassTag(event.target.value.toUpperCase())}
              className="rounded-lg border border-board-border px-3 py-2"
              placeholder="Klass (valfritt)"
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as NotePriority)}
              className="rounded-lg border border-board-border px-3 py-2"
            >
              {priorities.map((option) => (
                <option key={option} value={option}>
                  {PRIORITY_LABELS[option]}
                </option>
              ))}
            </select>
            <select
              value={color}
              onChange={(event) => setColor(event.target.value as NoteColor)}
              className="rounded-lg border border-board-border px-3 py-2"
            >
              {colors.map((option) => (
                <option key={option} value={option}>
                  {NOTE_COLOR_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="rounded-lg bg-board-text px-4 py-2 text-sm font-semibold text-board-bg">
              Skapa lapp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
