import {
  APP_STATE_VERSION,
  APP_STORAGE_KEY,
  DEFAULT_MODULE_STYLE,
  DEFAULT_SETTINGS,
  DEFAULT_VIEW,
  MODULE_IDS,
  createDefaultAdminDesignState
} from "@/lib/constants";
import { sanitizeImportedNote } from "@/lib/note-utils";
import type { BoardModuleId, DesignFontFamily, ModuleDesignStyle, PersistedBoardState } from "@/lib/types";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface BoardFlowDbSchema extends DBSchema {
  app: {
    key: string;
    value: PersistedBoardState;
  };
}

const DB_NAME = "boardflow";
const DB_VERSION = 1;
const STORE_NAME = "app";
const STATE_KEY = "state";

let dbPromise: Promise<IDBPDatabase<BoardFlowDbSchema>> | null = null;
let forceLocalFallback = false;
let memoryFallback: PersistedBoardState | null = null;

function createDefaultState(): PersistedBoardState {
  return {
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
}

function cloneState(state: PersistedBoardState): PersistedBoardState {
  return JSON.parse(JSON.stringify(state)) as PersistedBoardState;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isBoardModuleId(value: unknown): value is BoardModuleId {
  return typeof value === "string" && MODULE_IDS.includes(value as BoardModuleId);
}

function normalizeFontFamily(value: unknown): DesignFontFamily {
  if (value === "serif" || value === "mono" || value === "display" || value === "sans") {
    return value;
  }
  return DEFAULT_MODULE_STYLE.fontFamily;
}

function normalizeModuleStyle(value: unknown): ModuleDesignStyle {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_MODULE_STYLE };
  }

  const candidate = value as Partial<ModuleDesignStyle>;

  return {
    offsetX: typeof candidate.offsetX === "number" ? clamp(candidate.offsetX, -900, 900) : DEFAULT_MODULE_STYLE.offsetX,
    offsetY: typeof candidate.offsetY === "number" ? clamp(candidate.offsetY, -900, 900) : DEFAULT_MODULE_STYLE.offsetY,
    widthPercent:
      typeof candidate.widthPercent === "number"
        ? clamp(candidate.widthPercent, 30, 100)
        : DEFAULT_MODULE_STYLE.widthPercent,
    minHeight:
      typeof candidate.minHeight === "number" ? clamp(candidate.minHeight, 0, 1500) : DEFAULT_MODULE_STYLE.minHeight,
    opacity: typeof candidate.opacity === "number" ? clamp(candidate.opacity, 0.2, 1) : DEFAULT_MODULE_STYLE.opacity,
    fontScale:
      typeof candidate.fontScale === "number" ? clamp(candidate.fontScale, 0.7, 1.6) : DEFAULT_MODULE_STYLE.fontScale,
    fontFamily: normalizeFontFamily(candidate.fontFamily)
  };
}

function normalizeState(raw: unknown): PersistedBoardState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<PersistedBoardState>;
  const notesRaw = Array.isArray(candidate.notes) ? candidate.notes : [];
  const notes = notesRaw.map(sanitizeImportedNote).filter((note): note is NonNullable<typeof note> => Boolean(note));
  const defaultAdminDesign = createDefaultAdminDesignState();
  const rawAdminDesign =
    candidate.settings?.adminDesign && typeof candidate.settings.adminDesign === "object"
      ? candidate.settings.adminDesign
      : null;
  const rawAdminModules =
    rawAdminDesign && "modules" in rawAdminDesign && rawAdminDesign.modules && typeof rawAdminDesign.modules === "object"
      ? (rawAdminDesign.modules as Partial<Record<BoardModuleId, unknown>>)
      : {};
  const normalizedModules = MODULE_IDS.reduce<Record<BoardModuleId, ModuleDesignStyle>>(
    (acc, moduleId) => {
      acc[moduleId] = normalizeModuleStyle(rawAdminModules[moduleId]);
      return acc;
    },
    {
      topbar: { ...DEFAULT_MODULE_STYLE },
      archiveToggle: { ...DEFAULT_MODULE_STYLE },
      filters: { ...DEFAULT_MODULE_STYLE },
      status: { ...DEFAULT_MODULE_STYLE },
      board: { ...DEFAULT_MODULE_STYLE },
      reminders: { ...DEFAULT_MODULE_STYLE }
    }
  );
  const selectedModule =
    rawAdminDesign && "selectedModule" in rawAdminDesign && isBoardModuleId(rawAdminDesign.selectedModule)
      ? rawAdminDesign.selectedModule
      : defaultAdminDesign.selectedModule;
  const adminEnabled =
    rawAdminDesign && "enabled" in rawAdminDesign ? Boolean(rawAdminDesign.enabled) : defaultAdminDesign.enabled;

  return {
    version: APP_STATE_VERSION,
    notes,
    view: {
      mode:
        candidate.view?.mode === "free" || candidate.view?.mode === "columns" || candidate.view?.mode === "class"
          ? candidate.view.mode
          : "free",
      filters: {
        classTag:
          typeof candidate.view?.filters?.classTag === "string" ? candidate.view.filters.classTag : null,
        priority:
          candidate.view?.filters?.priority === "low" ||
          candidate.view?.filters?.priority === "medium" ||
          candidate.view?.filters?.priority === "high" ||
          candidate.view?.filters?.priority === "all"
            ? candidate.view.filters.priority
            : "all",
        weekNumber:
          typeof candidate.view?.filters?.weekNumber === "number" ? candidate.view.filters.weekNumber : null,
        status:
          candidate.view?.filters?.status === "board" ||
          candidate.view?.filters?.status === "todo" ||
          candidate.view?.filters?.status === "doing" ||
          candidate.view?.filters?.status === "done" ||
          candidate.view?.filters?.status === "archived" ||
          candidate.view?.filters?.status === "all"
            ? candidate.view.filters.status
            : "all",
        search: typeof candidate.view?.filters?.search === "string" ? candidate.view.filters.search : "",
        onlyCurrentWeek: Boolean(candidate.view?.filters?.onlyCurrentWeek),
        includeArchived: Boolean(candidate.view?.filters?.includeArchived)
      },
      sort: "updatedAtDesc"
    },
    settings: {
      theme:
        candidate.settings?.theme === "dark" ||
        candidate.settings?.theme === "light" ||
        candidate.settings?.theme === "system"
          ? candidate.settings.theme
          : "system",
      autoArchivePastWeeks: Boolean(candidate.settings?.autoArchivePastWeeks),
      adminDesign: {
        enabled: adminEnabled,
        selectedModule,
        modules: normalizedModules
      }
    },
    dismissedReminderIds: Array.isArray(candidate.dismissedReminderIds)
      ? candidate.dismissedReminderIds.filter((id) => typeof id === "string")
      : [],
    sentReminderIds: Array.isArray(candidate.sentReminderIds)
      ? candidate.sentReminderIds.filter((id) => typeof id === "string")
      : []
  };
}

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<BoardFlowDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      }
    });
  }
  return dbPromise;
}

function readFromLocalStorage(): PersistedBoardState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeToLocalStorage(state: PersistedBoardState) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    memoryFallback = cloneState(state);
  }
}

export async function loadPersistedState(): Promise<PersistedBoardState> {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  if (!forceLocalFallback) {
    try {
      const db = await getDb();
      const raw = await db.get(STORE_NAME, STATE_KEY);
      const normalized = normalizeState(raw);
      if (normalized) {
        return normalized;
      }
    } catch {
      forceLocalFallback = true;
    }
  }

  const local = readFromLocalStorage();
  if (local) {
    return local;
  }

  return memoryFallback ? cloneState(memoryFallback) : createDefaultState();
}

export async function savePersistedState(state: PersistedBoardState): Promise<void> {
  const cloned = cloneState(state);

  if (typeof window === "undefined") {
    memoryFallback = cloned;
    return;
  }

  if (!forceLocalFallback) {
    try {
      const db = await getDb();
      await db.put(STORE_NAME, cloned, STATE_KEY);
    } catch {
      forceLocalFallback = true;
    }
  }

  writeToLocalStorage(cloned);
}
