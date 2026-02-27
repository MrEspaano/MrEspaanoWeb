import { DEFAULT_NOTE_COLOR, DEFAULT_PRIORITY } from "@/lib/constants";
import { getCurrentWeekNumber } from "@/lib/date";
import type {
  BoardFilters,
  ImportSummary,
  Note,
  NoteColor,
  NotePriority,
  NoteStatus,
  QuickParseResult
} from "@/lib/types";

const COLOR_SET: NoteColor[] = ["slate", "blue", "green", "amber", "rose", "violet"];
const PRIORITY_SET: NotePriority[] = ["low", "medium", "high"];
const STATUS_SET: NoteStatus[] = ["board", "todo", "doing", "done", "archived"];
const isValidWeek = (value: unknown): value is number => {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 53;
};

function normalizeWeekNumbers(weekNumbers?: number[], weekNumber?: number) {
  const fromArray = Array.isArray(weekNumbers) ? weekNumbers.filter(isValidWeek) : [];
  const fallback = isValidWeek(weekNumber) ? [weekNumber] : [];
  return Array.from(new Set([...fromArray, ...fallback])).sort((a, b) => a - b);
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createNote(input?: Partial<QuickParseResult> & { title?: string; body?: string }): Note {
  const now = nowIso();
  const title = input?.title?.trim() || "Ny lapp";
  const body = input?.body?.trim() || "";

  return {
    id: createId(),
    title,
    body,
    color: DEFAULT_NOTE_COLOR,
    classTag: input?.classTag || undefined,
    priority: input?.priority || DEFAULT_PRIORITY,
    reminderAt: input?.reminderAt,
    weekNumber: input?.weekNumber,
    weekNumbers: normalizeWeekNumbers(input?.weekNumbers, input?.weekNumber),
    status: "board",
    position: { x: 24, y: 24 },
    createdAt: now,
    updatedAt: now
  };
}

export function sortByUpdatedAtDesc(notes: Note[]): Note[] {
  return [...notes].sort((first, second) => {
    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
  });
}

export function sanitizeImportedNote(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Partial<Note>;
  if (!candidate.id || typeof candidate.id !== "string") {
    return null;
  }

  const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
  if (!title) {
    return null;
  }

  const color: NoteColor = COLOR_SET.includes(candidate.color as NoteColor)
    ? (candidate.color as NoteColor)
    : DEFAULT_NOTE_COLOR;
  const priority: NotePriority = PRIORITY_SET.includes(candidate.priority as NotePriority)
    ? (candidate.priority as NotePriority)
    : DEFAULT_PRIORITY;
  const status: NoteStatus = STATUS_SET.includes(candidate.status as NoteStatus)
    ? (candidate.status as NoteStatus)
    : "board";
  const position =
    candidate.position &&
    typeof candidate.position.x === "number" &&
    typeof candidate.position.y === "number"
      ? candidate.position
      : { x: 24, y: 24 };
  const createdAt =
    typeof candidate.createdAt === "string" && !Number.isNaN(Date.parse(candidate.createdAt))
      ? candidate.createdAt
      : nowIso();
  const updatedAt =
    typeof candidate.updatedAt === "string" && !Number.isNaN(Date.parse(candidate.updatedAt))
      ? candidate.updatedAt
      : createdAt;
  const reminderAt =
    typeof candidate.reminderAt === "string" && !Number.isNaN(Date.parse(candidate.reminderAt))
      ? candidate.reminderAt
      : undefined;
  const weekNumber = isValidWeek(candidate.weekNumber) ? candidate.weekNumber : undefined;
  const weekNumbers = normalizeWeekNumbers(candidate.weekNumbers, weekNumber);

  return {
    id: candidate.id,
    title,
    body: typeof candidate.body === "string" ? candidate.body : "",
    color,
    classTag: typeof candidate.classTag === "string" && candidate.classTag.trim() ? candidate.classTag : undefined,
    priority,
    reminderAt,
    weekNumber,
    weekNumbers,
    status,
    position,
    createdAt,
    updatedAt
  };
}

export function mergeImportedNotes(existing: Note[], incomingRaw: unknown[]): {
  notes: Note[];
  summary: ImportSummary;
} {
  const existingIds = new Set(existing.map((note) => note.id));
  const result = [...existing];
  let conflicts = 0;
  let invalid = 0;
  let added = 0;

  for (const raw of incomingRaw) {
    const sanitized = sanitizeImportedNote(raw);
    if (!sanitized) {
      invalid += 1;
      continue;
    }

    const note = { ...sanitized };
    if (existingIds.has(note.id)) {
      conflicts += 1;
      note.id = createId();
      note.updatedAt = nowIso();
    }

    existingIds.add(note.id);
    result.push(note);
    added += 1;
  }

  return {
    notes: sortByUpdatedAtDesc(result),
    summary: {
      added,
      conflicts,
      invalid
    }
  };
}

export function filterNotes(notes: Note[], filters: BoardFilters): Note[] {
  const query = filters.search.trim().toLowerCase();
  const currentWeek = getCurrentWeekNumber();

  return notes.filter((note) => {
    if (!filters.includeArchived && note.status === "archived") {
      return false;
    }
    if (filters.status !== "all" && note.status !== filters.status) {
      return false;
    }
    if (filters.classTag && note.classTag !== filters.classTag) {
      return false;
    }
    if (filters.priority !== "all" && note.priority !== filters.priority) {
      return false;
    }
    const noteWeeks = normalizeWeekNumbers(note.weekNumbers, note.weekNumber);
    if (filters.weekNumber && !noteWeeks.includes(filters.weekNumber)) {
      return false;
    }
    if (filters.onlyCurrentWeek && !noteWeeks.includes(currentWeek)) {
      return false;
    }
    if (query.length > 0) {
      const haystack = `${note.title} ${note.body}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function getDueReminders(
  notes: Note[],
  dismissedReminderIds: string[],
  sentReminderIds: string[],
  now: Date = new Date()
): Note[] {
  const dismissed = new Set(dismissedReminderIds);
  const sent = new Set(sentReminderIds);
  const nowTime = now.getTime();

  return notes
    .filter((note) => {
      if (!note.reminderAt || note.status === "archived") {
        return false;
      }
      if (dismissed.has(note.id) || sent.has(note.id)) {
        return false;
      }
      return new Date(note.reminderAt).getTime() <= nowTime;
    })
    .sort((first, second) => {
      return new Date(first.reminderAt ?? "").getTime() - new Date(second.reminderAt ?? "").getTime();
    });
}

export function archivePastWeekNotes(notes: Note[], currentWeek = getCurrentWeekNumber()): {
  notes: Note[];
  changed: number;
} {
  let changed = 0;
  const nextNotes: Note[] = notes.map((note): Note => {
    const noteWeeks = normalizeWeekNumbers(note.weekNumbers, note.weekNumber);
    const hasFutureOrCurrentWeek = noteWeeks.some((week) => week >= currentWeek);
    if (noteWeeks.length === 0 || hasFutureOrCurrentWeek || note.status === "archived") {
      return note;
    }
    changed += 1;
    return {
      ...note,
      status: "archived" as const,
      updatedAt: nowIso()
    };
  });

  return {
    notes: sortByUpdatedAtDesc(nextNotes),
    changed
  };
}
