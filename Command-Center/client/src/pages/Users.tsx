export default function Users() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          User management and permissions coming soon.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-sm text-muted-foreground">
        No user directory configured yet. Hook up your identity provider or directory service to manage access.
      </div>
    </div>
  );
}
