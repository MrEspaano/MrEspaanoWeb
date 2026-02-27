"use client";

import { NoteCard } from "@/components/note-card";
import type { Note } from "@/lib/types";

interface ClassViewProps {
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

function groupByClassTag(notes: Note[]) {
  return notes.reduce<Record<string, Note[]>>((acc, note) => {
    const key = note.classTag?.trim() || "Utan klass";
    acc[key] = acc[key] ?? [];
    acc[key].push(note);
    return acc;
  }, {});
}

export function ClassView({ notes, onUpdate, onDelete }: ClassViewProps) {
  const groups = groupByClassTag(notes);
  const classNames = Object.keys(groups).sort((first, second) => first.localeCompare(second, "sv"));

  if (notes.length === 0) {
    return (
      <section className="rounded-xl2 border border-board-border bg-board-panel p-10 text-center shadow-card">
        <p className="text-board-muted">Inga lappar att visa i klassvy.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {classNames.map((className) => (
        <section key={className} className="rounded-xl2 border border-board-border bg-board-panel p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{className}</h3>
            <span className="rounded-full border border-board-border px-2 py-1 text-xs text-board-muted">
              {groups[className].length}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups[className].map((note) => (
              <NoteCard key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
