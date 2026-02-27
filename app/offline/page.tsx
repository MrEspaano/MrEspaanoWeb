export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-8">
      <div className="w-full rounded-xl2 border border-board-border bg-board-panel p-8 text-center shadow-card">
        <p className="text-sm uppercase tracking-[0.2em] text-board-muted">Offline</p>
        <h1 className="mt-2 text-2xl font-bold text-board-text">BoardFlow är offline</h1>
        <p className="mt-4 text-board-muted">
          Dina lappar finns kvar lokalt. När du är online igen synkas app-shell automatiskt.
        </p>
      </div>
    </main>
  );
}
