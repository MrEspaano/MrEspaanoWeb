"use client";

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { NoteCard } from "@/components/note-card";
import { WeekDropRow } from "@/components/week-drop-row";
import { STATUS_LABELS } from "@/lib/constants";
import type { Note, NoteStatus } from "@/lib/types";

interface ColumnsViewProps {
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: NoteStatus) => void;
  onSetWeek: (id: string, weekNumber: number) => void;
  selectedWeek: number | null;
  onSelectWeek: (weekNumber: number | null) => void;
}

const columns: Array<{ id: NoteStatus; label: string; accepts: NoteStatus[] }> = [
  { id: "todo", label: "To do", accepts: ["board", "todo"] },
  { id: "doing", label: "Pågår", accepts: ["doing"] },
  { id: "done", label: "Klart", accepts: ["done"] }
];

function DraggableColumnNote({
  note,
  onUpdate,
  onDelete
}: {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    data: {
      noteId: note.id,
      type: "note"
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
      }}
    >
      <NoteCard
        note={note}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}

function Column({
  id,
  label,
  notes,
  onUpdate,
  onDelete
}: {
  id: NoteStatus;
  label: string;
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`
  });

  return (
    <section className="flex min-h-[620px] flex-col rounded-xl2 border border-board-border bg-board-panel p-3 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="rounded-full border border-board-border px-2 py-1 text-xs text-board-muted">{notes.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[560px] flex-col gap-3 rounded-lg border border-dashed p-2 transition ${
          isOver ? "border-board-text bg-board-bg/70" : "border-board-border"
        }`}
      >
        {notes.map((note) => (
          <DraggableColumnNote key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

export function ColumnsView({
  notes,
  onUpdate,
  onDelete,
  onSetStatus,
  onSetWeek,
  selectedWeek,
  onSelectWeek
}: ColumnsViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const noteId = String(active.id);
    const overId = String(over.id);
    if (overId.startsWith("column-")) {
      const status = overId.replace("column-", "") as NoteStatus;
      onSetStatus(noteId, status);
    }

    if (overId.startsWith("week-")) {
      const weekNumber = Number(overId.replace("week-", ""));
      if (!Number.isNaN(weekNumber)) {
        onSetWeek(noteId, weekNumber);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-w-0 space-y-3">
        <WeekDropRow selectedWeek={selectedWeek} onSelectWeek={onSelectWeek} />
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => {
            const columnNotes = notes.filter((note) => column.accepts.includes(note.status));
            return (
              <Column
                key={column.id}
                id={column.id}
                label={column.label}
                notes={columnNotes}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            );
          })}
        </div>
        {notes.length === 0 ? (
          <p className="rounded-xl border border-board-border bg-board-panel p-4 text-center text-board-muted">
            Inga lappar matchar filtren.
          </p>
        ) : null}
      </div>
      <div className="sr-only">{STATUS_LABELS.board}</div>
    </DndContext>
  );
}
