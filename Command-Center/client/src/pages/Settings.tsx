export default function Settings() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Config</h2>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Environment toggles and integrations will live here.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-sm text-muted-foreground">
        Settings panel not configured yet. Wire in environment variables or feature flags to make this page actionable.
      </div>
    </div>
  );
}
