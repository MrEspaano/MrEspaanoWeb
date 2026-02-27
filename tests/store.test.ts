import { describe, expect, it } from "vitest";
import { archivePastWeekNotes, mergeImportedNotes } from "@/lib/note-utils";
import type { Note } from "@/lib/types";

const baseNote: Note = {
  id: "a",
  title: "Test",
  body: "Body",
  color: "blue",
  classTag: "8B",
  priority: "medium",
  reminderAt: undefined,
  weekNumber: 8,
  status: "todo",
  position: { x: 12, y: 18 },
  createdAt: "2026-02-01T10:00:00.000Z",
  updatedAt: "2026-02-01T10:00:00.000Z"
};

describe("mergeImportedNotes", () => {
  it("hanterar id-konflikter och invalida poster", () => {
    const existing = [baseNote];
    const incoming = [
      {
        ...baseNote,
        title: "Ny titel"
      },
      {
        id: "b",
        title: "Annan lapp",
        body: "",
        color: "green",
        priority: "low",
        status: "board",
        position: { x: 1, y: 2 },
        createdAt: "2026-02-04T10:00:00.000Z",
        updatedAt: "2026-02-04T10:00:00.000Z"
      },
      {
        bad: true
      }
    ];

    const { notes, summary } = mergeImportedNotes(existing, incoming);
    const ids = notes.map((note) => note.id);

    expect(summary.added).toBe(2);
    expect(summary.conflicts).toBe(1);
    expect(summary.invalid).toBe(1);
    expect(new Set(ids).size).toBe(ids.length);
    expect(notes.some((note) => note.title === "Annan lapp")).toBe(true);
  });
});

describe("archivePastWeekNotes", () => {
  it("arkiverar lappar med passerad vecka", () => {
    const notes: Note[] = [
      baseNote,
      {
        ...baseNote,
        id: "b",
        weekNumber: 12,
        status: "doing"
      },
      {
        ...baseNote,
        id: "c",
        weekNumber: 4,
        status: "archived"
      }
    ];
    const result = archivePastWeekNotes(notes, 10);

    expect(result.changed).toBe(1);
    expect(result.notes.find((note) => note.id === "a")?.status).toBe("archived");
    expect(result.notes.find((note) => note.id === "b")?.status).toBe("doing");
    expect(result.notes.find((note) => note.id === "c")?.status).toBe("archived");
  });
});
