"use client";

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { WeekDropRow } from "@/components/week-drop-row";
import { NOTE_HEIGHT, NOTE_WIDTH } from "@/lib/constants";
import type { Note } from "@/lib/types";
import { NoteCard } from "@/components/note-card";

interface FreeBoardViewProps {
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onSetWeek: (id: string, weekNumber: number) => void;
  selectedWeek: number | null;
  onSelectWeek: (weekNumber: number | null) => void;
}

function DraggableFreeNote({
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
      type: "note",
      noteId: note.id,
      position: note.position
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        width: NOTE_WIDTH,
        minHeight: NOTE_HEIGHT,
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 30 : 10
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

export function FreeBoardView({
  notes,
  onUpdate,
  onDelete,
  onMove,
  onSetWeek,
  selectedWeek,
  onSelectWeek
}: FreeBoardViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    })
  );

  const { setNodeRef, isOver } = useDroppable({
    id: "free-board"
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event;
    const noteId = String(active.id);
    const overId = over ? String(over.id) : "";
    const sourcePosition = active.data.current?.position as { x: number; y: number } | undefined;
    if (!sourcePosition) {
      return;
    }

    if (overId.startsWith("week-")) {
      const weekNumber = Number(overId.replace("week-", ""));
      if (!Number.isNaN(weekNumber)) {
        onSetWeek(noteId, weekNumber);
      }
    }

    onMove(noteId, {
      x: Math.max(0, Math.round(sourcePosition.x + delta.x)),
      y: Math.max(0, Math.round(sourcePosition.y + delta.y))
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-w-0 space-y-3">
        <WeekDropRow selectedWeek={selectedWeek} onSelectWeek={onSelectWeek} />
        <section
          ref={setNodeRef}
          className={`relative min-h-[680px] overflow-hidden rounded-xl2 border border-dashed p-4 transition ${
            isOver ? "border-board-text bg-board-panel" : "border-board-border bg-board-panel/75"
          }`}
        >
          {notes.length === 0 ? (
            <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-board-border bg-board-panel">
              <p className="max-w-sm text-center text-board-muted">
                Tom tavla. Skapa en lapp med knappen{" "}
                <span className="font-semibold text-board-text">Ny lapp</span> eller kortkommandot{" "}
                <span className="font-semibold text-board-text">N</span>.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <DraggableFreeNote key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} />
            ))
          )}
        </section>
      </div>
    </DndContext>
  );
}
