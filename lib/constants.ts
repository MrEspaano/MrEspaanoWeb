import type {
  AdminDesignState,
  BoardFilters,
  BoardModuleId,
  BoardSettings,
  BoardViewState,
  DesignFontFamily,
  ModuleDesignStyle,
  NoteColor,
  NotePriority,
  NoteStatus
} from "@/lib/types";

export const APP_STATE_VERSION = 1;
export const APP_STORAGE_KEY = "boardflow.state.v1";

export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  slate: "Skiffer",
  blue: "Blå",
  green: "Grön",
  amber: "Bärnsten",
  rose: "Ros",
  violet: "Violett"
};

export const NOTE_COLOR_CLASS: Record<NoteColor, string> = {
  slate: "bg-slate-100 dark:bg-slate-800/70",
  blue: "bg-sky-100 dark:bg-sky-900/50",
  green: "bg-emerald-100 dark:bg-emerald-900/45",
  amber: "bg-amber-100 dark:bg-amber-900/40",
  rose: "bg-rose-100 dark:bg-rose-900/45",
  violet: "bg-violet-100 dark:bg-violet-900/45"
};

export const PRIORITY_LABELS: Record<NotePriority, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög"
};

export const STATUS_LABELS: Record<NoteStatus, string> = {
  board: "Tavla",
  todo: "To do",
  doing: "Pågår",
  done: "Klart",
  archived: "Arkiv"
};

export const DEFAULT_NOTE_COLOR: NoteColor = "blue";
export const DEFAULT_PRIORITY: NotePriority = "medium";
export const NOTE_WIDTH = 280;
export const NOTE_HEIGHT = 190;

export const DEFAULT_FILTERS: BoardFilters = {
  classTag: null,
  priority: "all",
  weekNumber: null,
  status: "all",
  search: "",
  onlyCurrentWeek: false,
  includeArchived: false
};

export const DEFAULT_VIEW: BoardViewState = {
  mode: "free",
  filters: { ...DEFAULT_FILTERS },
  sort: "updatedAtDesc"
};

function createDefaultModuleStyle(): ModuleDesignStyle {
  return {
    offsetX: 0,
    offsetY: 0,
    widthPercent: 100,
    minHeight: 0,
    opacity: 1,
    fontScale: 1,
    fontFamily: "sans"
  };
}

export const DEFAULT_SETTINGS: BoardSettings = {
  theme: "system",
  autoArchivePastWeeks: false,
  adminDesign: createDefaultAdminDesignState()
};

export const COLUMN_STATUSES = ["todo", "doing", "done"] as const;

export const MODULE_IDS: BoardModuleId[] = ["topbar", "archiveToggle", "filters", "status", "board", "reminders"];

export const MODULE_LABELS: Record<BoardModuleId, string> = {
  topbar: "Topbar",
  archiveToggle: "Arkivväxling",
  filters: "Filterrad",
  status: "Statusmeddelande",
  board: "Huvudyta",
  reminders: "Påminnelser"
};

export const FONT_FAMILY_LABELS: Record<DesignFontFamily, string> = {
  sans: "Sans",
  serif: "Serif",
  mono: "Mono",
  display: "Display"
};

export const FONT_FAMILY_STACKS: Record<DesignFontFamily, string> = {
  sans: "\"Plus Jakarta Sans\", \"Avenir Next\", \"Segoe UI\", sans-serif",
  serif: "\"Fraunces\", \"Iowan Old Style\", \"Times New Roman\", serif",
  mono: "\"JetBrains Mono\", \"SFMono-Regular\", \"Consolas\", monospace",
  display: "\"Sora\", \"Avenir Next\", \"Segoe UI\", sans-serif"
};

export const DEFAULT_MODULE_STYLE: ModuleDesignStyle = {
  ...createDefaultModuleStyle()
};

export function createDefaultAdminDesignState(): AdminDesignState {
  return {
    enabled: false,
    selectedModule: "topbar",
    modules: {
      topbar: createDefaultModuleStyle(),
      archiveToggle: createDefaultModuleStyle(),
      filters: createDefaultModuleStyle(),
      status: createDefaultModuleStyle(),
      board: createDefaultModuleStyle(),
      reminders: createDefaultModuleStyle()
    }
  };
}
