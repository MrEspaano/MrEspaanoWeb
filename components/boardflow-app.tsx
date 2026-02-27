"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminDesignPanel } from "@/components/admin-design-panel";
import { ClassView } from "@/components/class-view";
import { ColumnsView } from "@/components/columns-view";
import { DesignModuleShell } from "@/components/design-module-shell";
import { FilterBar } from "@/components/filter-bar";
import { FreeBoardView } from "@/components/free-board-view";
import { NewNoteModal } from "@/components/new-note-modal";
import { NoteCard } from "@/components/note-card";
import { RemindersPanel } from "@/components/reminders-panel";
import { TopBar } from "@/components/topbar";
import { getCurrentWeekNumber } from "@/lib/date";
import { filterNotes, getDueReminders, sortByUpdatedAtDesc } from "@/lib/note-utils";
import { useBoardStore } from "@/store/board-store";

export function BoardFlowApp() {
  const hydrated = useBoardStore((state) => state.hydrated);
  const notes = useBoardStore((state) => state.notes);
  const view = useBoardStore((state) => state.view);
  const settings = useBoardStore((state) => state.settings);
  const dismissedReminderIds = useBoardStore((state) => state.dismissedReminderIds);
  const sentReminderIds = useBoardStore((state) => state.sentReminderIds);

  const hydrate = useBoardStore((state) => state.hydrate);
  const createNote = useBoardStore((state) => state.createNote);
  const createFromQuickInput = useBoardStore((state) => state.createFromQuickInput);
  const updateNote = useBoardStore((state) => state.updateNote);
  const updateNotePosition = useBoardStore((state) => state.updateNotePosition);
  const updateNoteStatus = useBoardStore((state) => state.updateNoteStatus);
  const updateNoteWeek = useBoardStore((state) => state.updateNoteWeek);
  const removeNote = useBoardStore((state) => state.removeNote);
  const setViewMode = useBoardStore((state) => state.setViewMode);
  const updateFilters = useBoardStore((state) => state.updateFilters);
  const resetFilters = useBoardStore((state) => state.resetFilters);
  const toggleTheme = useBoardStore((state) => state.toggleTheme);
  const dismissReminder = useBoardStore((state) => state.dismissReminder);
  const markReminderSent = useBoardStore((state) => state.markReminderSent);
  const setAutoArchivePastWeeks = useBoardStore((state) => state.setAutoArchivePastWeeks);
  const setAdminDesignEnabled = useBoardStore((state) => state.setAdminDesignEnabled);
  const setAdminSelectedModule = useBoardStore((state) => state.setAdminSelectedModule);
  const updateAdminModuleStyle = useBoardStore((state) => state.updateAdminModuleStyle);
  const resetAdminModuleStyle = useBoardStore((state) => state.resetAdminModuleStyle);
  const resetAdminDesign = useBoardStore((state) => state.resetAdminDesign);
  const runAutoArchive = useBoardStore((state) => state.runAutoArchive);
  const exportData = useBoardStore((state) => state.exportData);
  const importData = useBoardStore((state) => state.importData);

  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [showArchiveView, setShowArchiveView] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const currentWeek = getCurrentWeekNumber();

  const classTags = useMemo(() => {
    return Array.from(
      new Set(
        notes
          .map((note) => note.classTag?.trim())
          .filter((tag): tag is string => Boolean(tag))
          .sort((first, second) => first.localeCompare(second, "sv"))
      )
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return sortByUpdatedAtDesc(filterNotes(notes, view.filters));
  }, [notes, view.filters]);

  const archivedNotes = useMemo(() => {
    const archiveFilters = {
      ...view.filters,
      includeArchived: true,
      status: view.filters.status === "all" ? "archived" : view.filters.status
    };
    return sortByUpdatedAtDesc(filterNotes(notes, archiveFilters).filter((note) => note.status === "archived"));
  }, [notes, view.filters]);

  const notesForCurrentView = useMemo(() => {
    if (showArchiveView) {
      return archivedNotes;
    }
    return filteredNotes;
  }, [filteredNotes, showArchiveView, archivedNotes]);

  const dueReminders = useMemo(() => {
    return getDueReminders(notes, dismissedReminderIds, sentReminderIds, new Date());
  }, [notes, dismissedReminderIds, sentReminderIds]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    setNotificationPermission(window.Notification.permission);
  }, []);

  useEffect(() => {
    if (settings.autoArchivePastWeeks) {
      runAutoArchive(getCurrentWeekNumber());
      const timerId = window.setInterval(() => {
        runAutoArchive(getCurrentWeekNumber());
      }, 1000 * 60 * 60);
      return () => window.clearInterval(timerId);
    }
  }, [settings.autoArchivePastWeeks, runAutoArchive]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldBeDark = settings.theme === "dark" || (settings.theme === "system" && media.matches);
      root.classList.toggle("dark", shouldBeDark);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings.theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "n") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }
      if (target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      setIsNewNoteOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (notificationPermission !== "granted" || typeof window === "undefined") {
      return;
    }
    dueReminders.forEach((note) => {
      try {
        const notification = new Notification(note.title, {
          body: note.body || "Påminnelse från BoardFlow"
        });
        notification.onclick = () => window.focus();
        markReminderSent(note.id);
      } catch {
        // Ignore notification failures and keep in-app reminder list.
      }
    });
  }, [dueReminders, notificationPermission, markReminderSent]);

  useEffect(() => {
    if (settings.adminDesign.enabled) {
      setIsAdminPanelOpen(true);
    }
  }, [settings.adminDesign.enabled]);

  const requestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const handleExport = () => {
    const payload = exportData();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `boardflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Export klar.");
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const summary = importData(text);
      setStatusMessage(
        `Import klar: ${summary.added} tillagda, ${summary.conflicts} id-konflikter, ${summary.invalid} ogiltiga poster.`
      );
    } catch {
      setStatusMessage("Import misslyckades: kunde inte läsa filen.");
    }
  };

  const renderBoard = () => {
    if (showArchiveView) {
      return (
        <section className="rounded-xl2 border border-board-border bg-board-panel p-4 shadow-card">
          <h2 className="mb-3 text-lg font-semibold">Arkiv</h2>
          {notesForCurrentView.length === 0 ? (
            <p className="rounded-lg border border-board-border p-6 text-center text-board-muted">
              Arkivet är tomt.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {notesForCurrentView.map((note) => (
                <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={removeNote} />
              ))}
            </div>
          )}
        </section>
      );
    }

    if (view.mode === "free") {
      return (
        <FreeBoardView
          notes={notesForCurrentView}
          onUpdate={updateNote}
          onDelete={removeNote}
          onMove={updateNotePosition}
          onSetWeek={updateNoteWeek}
          selectedWeek={view.filters.weekNumber}
          onSelectWeek={(weekNumber) => updateFilters({ weekNumber })}
        />
      );
    }

    if (view.mode === "columns") {
      return (
        <ColumnsView
          notes={notesForCurrentView.filter((note) => note.status !== "archived")}
          onUpdate={updateNote}
          onDelete={removeNote}
          onSetStatus={updateNoteStatus}
          onSetWeek={updateNoteWeek}
          selectedWeek={view.filters.weekNumber}
          onSelectWeek={(weekNumber) => updateFilters({ weekNumber })}
        />
      );
    }

    return <ClassView notes={notesForCurrentView} onUpdate={updateNote} onDelete={removeNote} />;
  };

  const adminDesign = settings.adminDesign;

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-8">
        <div className="rounded-xl2 border border-board-border bg-board-panel p-6 shadow-card">
          <p className="text-sm text-board-muted">Laddar BoardFlow...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6">
      <DesignModuleShell
        moduleId="topbar"
        design={adminDesign}
        canEdit={isAdminPanelOpen}
        onSelectModule={setAdminSelectedModule}
      >
        <TopBar
          mode={view.mode}
          search={view.filters.search}
          theme={settings.theme}
          isAdminPanelOpen={isAdminPanelOpen}
          onModeChange={setViewMode}
          onSearchChange={(search) => updateFilters({ search })}
          onNewNote={() => setIsNewNoteOpen(true)}
          onExport={handleExport}
          onImport={handleImport}
          onToggleTheme={toggleTheme}
          onToggleAdminPanel={() => setIsAdminPanelOpen((current) => !current)}
        />
      </DesignModuleShell>

      {isAdminPanelOpen ? (
        <div className="mt-4">
          <AdminDesignPanel
            design={adminDesign}
            onToggleEnabled={setAdminDesignEnabled}
            onSelectModule={setAdminSelectedModule}
            onUpdateStyle={updateAdminModuleStyle}
            onResetModule={resetAdminModuleStyle}
            onResetAll={resetAdminDesign}
          />
        </div>
      ) : null}

      <DesignModuleShell
        moduleId="archiveToggle"
        design={adminDesign}
        canEdit={isAdminPanelOpen}
        className="mt-4"
        onSelectModule={setAdminSelectedModule}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowArchiveView(false)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              !showArchiveView ? "border-board-text text-board-text" : "border-board-border text-board-muted"
            }`}
          >
            Aktiva vyer
          </button>
          <button
            type="button"
            onClick={() => setShowArchiveView(true)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              showArchiveView ? "border-board-text text-board-text" : "border-board-border text-board-muted"
            }`}
          >
            Arkiv
          </button>
        </div>
      </DesignModuleShell>

      <DesignModuleShell
        moduleId="filters"
        design={adminDesign}
        canEdit={isAdminPanelOpen}
        className="mt-3"
        onSelectModule={setAdminSelectedModule}
      >
        <FilterBar
          filters={view.filters}
          classTags={classTags}
          currentWeek={currentWeek}
          onChange={updateFilters}
          onReset={resetFilters}
        />
      </DesignModuleShell>

      {statusMessage ? (
        <DesignModuleShell
          moduleId="status"
          design={adminDesign}
          canEdit={isAdminPanelOpen}
          className="mt-3"
          onSelectModule={setAdminSelectedModule}
        >
          <p className="rounded-lg border border-board-border bg-board-panel px-4 py-2 text-sm text-board-muted">
            {statusMessage}
          </p>
        </DesignModuleShell>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <DesignModuleShell
          moduleId="board"
          design={adminDesign}
          canEdit={isAdminPanelOpen}
          className="min-w-0"
          onSelectModule={setAdminSelectedModule}
        >
          <div className="min-w-0">{renderBoard()}</div>
        </DesignModuleShell>
        <DesignModuleShell
          moduleId="reminders"
          design={adminDesign}
          canEdit={isAdminPanelOpen}
          className="min-w-0"
          onSelectModule={setAdminSelectedModule}
        >
          <div className="min-w-0">
            <RemindersPanel
              dueReminders={dueReminders}
              notificationPermission={notificationPermission}
              autoArchivePastWeeks={settings.autoArchivePastWeeks}
              onEnableNotifications={requestNotifications}
              onDismissReminder={dismissReminder}
              onToggleAutoArchive={setAutoArchivePastWeeks}
            />
          </div>
        </DesignModuleShell>
      </div>

      <button
        type="button"
        onClick={() => setIsNewNoteOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-board-text px-5 py-4 text-sm font-semibold text-board-bg shadow-card md:hidden"
      >
        Ny lapp
      </button>

      <NewNoteModal
        open={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        onCreate={(input) => createNote(input)}
        onQuickCreate={createFromQuickInput}
      />
    </main>
  );
}
