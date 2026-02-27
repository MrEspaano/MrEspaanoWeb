export type NoteColor = "slate" | "blue" | "green" | "amber" | "rose" | "violet";
export type NotePriority = "low" | "medium" | "high";
export type NoteStatus = "board" | "todo" | "doing" | "done" | "archived";
export type BoardMode = "free" | "columns" | "class";
export type ThemeMode = "system" | "light" | "dark";
export type DesignFontFamily = "sans" | "serif" | "mono" | "display";
export type BoardModuleId = "topbar" | "archiveToggle" | "filters" | "status" | "board" | "reminders";

export interface NotePosition {
  x: number;
  y: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  classTag?: string;
  priority: NotePriority;
  reminderAt?: string;
  weekNumber?: number;
  weekNumbers?: number[];
  status: NoteStatus;
  position: NotePosition;
  createdAt: string;
  updatedAt: string;
}

export interface BoardFilters {
  classTag: string | null;
  priority: NotePriority | "all";
  weekNumber: number | null;
  status: NoteStatus | "all";
  search: string;
  onlyCurrentWeek: boolean;
  includeArchived: boolean;
}

export interface BoardViewState {
  mode: BoardMode;
  filters: BoardFilters;
  sort: "updatedAtDesc";
}

export interface BoardSettings {
  theme: ThemeMode;
  autoArchivePastWeeks: boolean;
  adminDesign: AdminDesignState;
}

export interface ModuleDesignStyle {
  offsetX: number;
  offsetY: number;
  widthPercent: number;
  minHeight: number;
  opacity: number;
  fontScale: number;
  fontFamily: DesignFontFamily;
}

export interface AdminDesignState {
  enabled: boolean;
  selectedModule: BoardModuleId;
  modules: Record<BoardModuleId, ModuleDesignStyle>;
}

export interface PersistedBoardState {
  version: number;
  notes: Note[];
  view: BoardViewState;
  settings: BoardSettings;
  dismissedReminderIds: string[];
  sentReminderIds: string[];
}

export interface QuickParseResult {
  title: string;
  body: string;
  classTag?: string;
  priority: NotePriority;
  reminderAt?: string;
  weekNumber?: number;
  weekNumbers?: number[];
}

export interface ImportSummary {
  added: number;
  conflicts: number;
  invalid: number;
}
