"use client";

import { create } from "zustand";
import {
  APP_STATE_VERSION,
  DEFAULT_FILTERS,
  DEFAULT_MODULE_STYLE,
  DEFAULT_SETTINGS,
  DEFAULT_VIEW,
  MODULE_IDS,
  createDefaultAdminDesignState
} from "@/lib/constants";
import { getCurrentWeekNumber } from "@/lib/date";
import { archivePastWeekNotes, createNote, mergeImportedNotes, nowIso, sortByUpdatedAtDesc } from "@/lib/note-utils";
import { parseQuickInput } from "@/lib/parser";
import { loadPersistedState, savePersistedState } from "@/lib/storage";
import type {
  BoardModuleId,
  BoardFilters,
  BoardMode,
  ImportSummary,
  ModuleDesignStyle,
  Note,
  NoteColor,
  NotePriority,
  NoteStatus,
  PersistedBoardState,
  ThemeMode
} from "@/lib/types";

interface NoteDraft {
  title?: string;
  body?: string;
  color?: NoteColor;
  classTag?: string;
  priority?: NotePriority;
  reminderAt?: string;
  weekNumber?: number;
  weekNumbers?: number[];
  status?: NoteStatus;
  position?: {
    x: number;
    y: number;
  };
}

function normalizeWeeks(weekNumbers?: number[], weekNumber?: number) {
  const fromArray = Array.isArray(weekNumbers)
    ? weekNumbers.filter((week) => Number.isInteger(week) && week >= 1 && week <= 53)
    : [];
  const fromSingle =
    typeof weekNumber === "number" && Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 53
      ? [weekNumber]
      : [];
  return Array.from(new Set([...fromArray, ...fromSingle])).sort((a, b) => a - b);
}

interface BoardStoreState extends PersistedBoardState {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  createNote: (draft?: NoteDraft) => Note;
  createFromQuickInput: (input: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteStatus: (id: string, status: NoteStatus) => void;
  updateNoteWeek: (id: string, weekNumber?: number) => void;
  removeNote: (id: string) => void;
  setViewMode: (mode: BoardMode) => void;
  updateFilters: (partial: Partial<BoardFilters>) => void;
  resetFilters: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setAutoArchivePastWeeks: (enabled: boolean) => void;
  setAdminDesignEnabled: (enabled: boolean) => void;
  setAdminSelectedModule: (moduleId: BoardModuleId) => void;
  updateAdminModuleStyle: (moduleId: BoardModuleId, partial: Partial<ModuleDesignStyle>) => void;
  resetAdminModuleStyle: (moduleId: BoardModuleId) => void;
  resetAdminDesign: () => void;
  runAutoArchive: (currentWeek?: number) => number;
  dismissReminder: (noteId: string) => void;
  markReminderSent: (noteId: string) => void;
  clearReminderMarkers: (noteId: string) => void;
  exportData: () => string;
  importData: (jsonPayload: string) => ImportSummary;
}

function toPersistedState(store: BoardStoreState): PersistedBoardState {
  return {
    version: APP_STATE_VERSION,
    notes: sortByUpdatedAtDesc(store.notes),
    view: store.view,
    settings: store.settings,
    dismissedReminderIds: store.dismissedReminderIds,
    sentReminderIds: store.sentReminderIds
  };
}

function isTouchDevice() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(pointer: coarse)").matches;
}

const persistStore = async (state: BoardStoreState) => {
  await savePersistedState(toPersistedState(state));
};

const initialState: PersistedBoardState = {
  version: APP_STATE_VERSION,
  notes: [],
  view: {
    ...DEFAULT_VIEW,
    filters: { ...DEFAULT_VIEW.filters }
  },
  settings: {
    ...DEFAULT_SETTINGS,
    adminDesign: createDefaultAdminDesignState()
  },
  dismissedReminderIds: [],
  sentReminderIds: []
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeModuleStylePartial(partial: Partial<ModuleDesignStyle>) {
  const next: Partial<ModuleDesignStyle> = {};
  if (typeof partial.visible === "boolean") {
    next.visible = partial.visible;
  }
  if (typeof partial.offsetX === "number") {
    next.offsetX = clamp(Math.round(partial.offsetX), -900, 900);
  }
  if (typeof partial.offsetY === "number") {
    next.offsetY = clamp(Math.round(partial.offsetY), -900, 900);
  }
  if (typeof partial.widthPercent === "number") {
    next.widthPercent = clamp(Math.round(partial.widthPercent), 30, 100);
  }
  if (typeof partial.minHeight === "number") {
    next.minHeight = clamp(Math.round(partial.minHeight), 0, 1500);
  }
  if (typeof partial.opacity === "number") {
    next.opacity = clamp(Number(partial.opacity), 0.2, 1);
  }
  if (typeof partial.fontScale === "number") {
    next.fontScale = clamp(Number(partial.fontScale), 0.7, 1.6);
  }
  if (
    partial.fontFamily === "sans" ||
    partial.fontFamily === "serif" ||
    partial.fontFamily === "mono" ||
    partial.fontFamily === "display"
  ) {
    next.fontFamily = partial.fontFamily;
  }
  return next;
}

function getAutoPosition(notes: Note[], weekNumber?: number) {
  const sameBucket = notes.filter((note) => {
    if (note.status === "archived") {
      return false;
    }
    const noteWeeks = normalizeWeeks(note.weekNumbers, note.weekNumber);
    if (weekNumber) {
      return noteWeeks.includes(weekNumber);
    }
    return noteWeeks.length === 0;
  });

  const index = sameBucket.length;
  const columns = 3;
  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: 24 + column * 300,
    y: 24 + row * 220
  };
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  ...initialState,
  hydrated: false,

  hydrate: async () => {
    const persisted = await loadPersistedState();
    const shouldArchive = persisted.settings.autoArchivePastWeeks;
    const archived = shouldArchive ? archivePastWeekNotes(persisted.notes) : { notes: persisted.notes, changed: 0 };
    const notes = sortByUpdatedAtDesc(archived.notes);

    set({
      ...persisted,
      notes,
      hydrated: true
    });

    if (shouldArchive && archived.changed > 0) {
      await persistStore(get());
    }
  },

  createNote: (draft = {}) => {
    const base = createNote({
      title: draft.title,
      body: draft.body,
      classTag: draft.classTag,
      priority: draft.priority,
      reminderAt: draft.reminderAt,
      weekNumber: draft.weekNumber,
      weekNumbers: draft.weekNumbers
    });
    let created = base;
    set((state) => {
      const autoPosition = draft.position ??
        (isTouchDevice()
          ? {
              x: 14,
              y: 14
            }
          : getAutoPosition(state.notes, base.weekNumbers?.[0] ?? base.weekNumber));
      const withOverrides: Note = {
        ...base,
        color: draft.color ?? base.color,
        status: draft.status ?? "board",
        position: autoPosition
      };
      created = withOverrides;
      return {
        notes: sortByUpdatedAtDesc([withOverrides, ...state.notes])
      };
    });
    void persistStore(get());
    return created;
  },

  createFromQuickInput: (input: string) => {
    const parsed = parseQuickInput(input);
    return get().createNote(parsed);
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== id) {
          return note;
        }
        const nextClassTag =
          typeof updates.classTag === "string" ? updates.classTag.trim() || undefined : note.classTag;
        const mergedWeeks = normalizeWeeks(
          Array.isArray(updates.weekNumbers) ? updates.weekNumbers : note.weekNumbers,
          typeof updates.weekNumber === "number" ? updates.weekNumber : note.weekNumber
        );
        return {
          ...note,
          ...updates,
          classTag: nextClassTag,
          weekNumbers: mergedWeeks,
          weekNumber: mergedWeeks[0],
          updatedAt: nowIso()
        };
      })
    }));
    if (Object.prototype.hasOwnProperty.call(updates, "reminderAt")) {
      get().clearReminderMarkers(id);
      return;
    }
    void persistStore(get());
  },

  updateNotePosition: (id, position) => {
    get().updateNote(id, {
      position
    });
  },

  updateNoteStatus: (id, status) => {
    get().updateNote(id, {
      status
    });
  },

  updateNoteWeek: (id, weekNumber) => {
    if (!weekNumber) {
      return;
    }
    const note = get().notes.find((item) => item.id === id);
    if (!note) {
      return;
    }
    const mergedWeeks = normalizeWeeks([...(note.weekNumbers ?? []), weekNumber], note.weekNumber);
    get().updateNote(id, {
      weekNumbers: mergedWeeks,
      weekNumber: mergedWeeks[0]
    });
  },

  removeNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      dismissedReminderIds: state.dismissedReminderIds.filter((reminderId) => reminderId !== id),
      sentReminderIds: state.sentReminderIds.filter((reminderId) => reminderId !== id)
    }));
    void persistStore(get());
  },

  setViewMode: (mode) => {
    set((state) => ({
      view: {
        ...state.view,
        mode
      }
    }));
    void persistStore(get());
  },

  updateFilters: (partial) => {
    set((state) => ({
      view: {
        ...state.view,
        filters: {
          ...state.view.filters,
          ...partial
        }
      }
    }));
    void persistStore(get());
  },

  resetFilters: () => {
    set((state) => ({
      view: {
        ...state.view,
        filters: { ...DEFAULT_FILTERS }
      }
    }));
    void persistStore(get());
  },

  setTheme: (theme) => {
    set((state) => ({
      settings: {
        ...state.settings,
        theme
      }
    }));
    void persistStore(get());
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme =
        state.settings.theme === "dark" ? "light" : state.settings.theme === "light" ? "system" : "dark";
      return {
        settings: {
          ...state.settings,
          theme: nextTheme
        }
      };
    });
    void persistStore(get());
  },

  setAutoArchivePastWeeks: (enabled) => {
    set((state) => ({
      settings: {
        ...state.settings,
        autoArchivePastWeeks: enabled
      }
    }));
    void persistStore(get());
  },

  setAdminDesignEnabled: (enabled) => {
    set((state) => ({
      settings: {
        ...state.settings,
        adminDesign: {
          ...state.settings.adminDesign,
          enabled
        }
      }
    }));
    void persistStore(get());
  },

  setAdminSelectedModule: (moduleId) => {
    set((state) => ({
      settings: {
        ...state.settings,
        adminDesign: {
          ...state.settings.adminDesign,
          selectedModule: moduleId
        }
      }
    }));
    void persistStore(get());
  },

  updateAdminModuleStyle: (moduleId, partial) => {
    const safePartial = normalizeModuleStylePartial(partial);
    set((state) => ({
      settings: {
        ...state.settings,
        adminDesign: {
          ...state.settings.adminDesign,
          modules: {
            ...state.settings.adminDesign.modules,
            [moduleId]: {
              ...state.settings.adminDesign.modules[moduleId],
              ...safePartial
            }
          }
        }
      }
    }));
    void persistStore(get());
  },

  resetAdminModuleStyle: (moduleId) => {
    set((state) => ({
      settings: {
        ...state.settings,
        adminDesign: {
          ...state.settings.adminDesign,
          modules: {
            ...state.settings.adminDesign.modules,
            [moduleId]: { ...DEFAULT_MODULE_STYLE }
          }
        }
      }
    }));
    void persistStore(get());
  },

  resetAdminDesign: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        adminDesign: createDefaultAdminDesignState()
      }
    }));
    void persistStore(get());
  },

  runAutoArchive: (currentWeek = getCurrentWeekNumber()) => {
    let changed = 0;
    set((state) => {
      const archived = archivePastWeekNotes(state.notes, currentWeek);
      changed = archived.changed;
      return {
        notes: archived.notes
      };
    });

    if (changed > 0) {
      void persistStore(get());
    }

    return changed;
  },

  dismissReminder: (noteId) => {
    set((state) => ({
      dismissedReminderIds: state.dismissedReminderIds.includes(noteId)
        ? state.dismissedReminderIds
        : [...state.dismissedReminderIds, noteId]
    }));
    void persistStore(get());
  },

  markReminderSent: (noteId) => {
    set((state) => ({
      sentReminderIds: state.sentReminderIds.includes(noteId)
        ? state.sentReminderIds
        : [...state.sentReminderIds, noteId]
    }));
    void persistStore(get());
  },

  clearReminderMarkers: (noteId) => {
    set((state) => ({
      dismissedReminderIds: state.dismissedReminderIds.filter((id) => id !== noteId),
      sentReminderIds: state.sentReminderIds.filter((id) => id !== noteId)
    }));
    void persistStore(get());
  },

  exportData: () => {
    const payload = toPersistedState(get());
    return JSON.stringify(payload, null, 2);
  },

  importData: (jsonPayload) => {
    let raw: unknown;
    try {
      raw = JSON.parse(jsonPayload);
    } catch {
      return { added: 0, conflicts: 0, invalid: 1 };
    }

    const incoming = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { notes?: unknown[] }).notes)
        ? (raw as { notes: unknown[] }).notes
        : [];

    const { notes, summary } = mergeImportedNotes(get().notes, incoming);
    set((state) => ({
      notes,
      settings: {
        ...state.settings,
        adminDesign: {
          ...state.settings.adminDesign,
          selectedModule: MODULE_IDS.includes(state.settings.adminDesign.selectedModule)
            ? state.settings.adminDesign.selectedModule
            : "topbar"
        }
      }
    }));
    void persistStore(get());
    return summary;
  }
}));
