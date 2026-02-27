"use client";

import type { Note } from "@/lib/types";

interface RemindersPanelProps {
  dueReminders: Note[];
  notificationPermission: NotificationPermission | "unsupported";
  autoArchivePastWeeks: boolean;
  onEnableNotifications: () => void;
  onDismissReminder: (noteId: string) => void;
  onToggleAutoArchive: (value: boolean) => void;
}

export function RemindersPanel({
  dueReminders,
  notificationPermission,
  autoArchivePastWeeks,
  onEnableNotifications,
  onDismissReminder,
  onToggleAutoArchive
}: RemindersPanelProps) {
  return (
    <aside className="rounded-xl2 border border-board-border bg-board-panel p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Påminnelser</h2>
        <span className="rounded-full border border-board-border px-2 py-1 text-xs text-board-muted">
          {dueReminders.length}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted">
        <span>Browser-notiser</span>
        {notificationPermission === "granted" ? (
          <span className="font-medium text-emerald-600">Aktiva</span>
        ) : notificationPermission === "unsupported" ? (
          <span>Stöds inte</span>
        ) : (
          <button type="button" onClick={onEnableNotifications} className="font-medium text-board-text underline">
            Aktivera
          </button>
        )}
      </div>

      <label className="mt-3 flex items-center gap-2 rounded-lg border border-board-border px-3 py-2 text-sm text-board-muted">
        <input
          type="checkbox"
          checked={autoArchivePastWeeks}
          onChange={(event) => onToggleAutoArchive(event.target.checked)}
        />
        Arkivera automatiskt passerade veckor
      </label>

      {dueReminders.length === 0 ? (
        <p className="mt-3 rounded-lg border border-board-border bg-board-bg px-3 py-3 text-sm text-board-muted">
          Inga förfallna påminnelser.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {dueReminders.map((note) => (
            <li key={note.id} className="rounded-lg border border-board-border bg-board-bg px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{note.title}</p>
                  <p className="text-xs text-board-muted">
                    {note.reminderAt ? new Date(note.reminderAt).toLocaleString("sv-SE") : "Ingen tid"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismissReminder(note.id)}
                  className="rounded-md border border-board-border px-2 py-1 text-xs text-board-muted hover:text-board-text"
                >
                  Klarmarkera
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
