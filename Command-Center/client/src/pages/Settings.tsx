import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings, type SettingsPayload } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const defaultSettings: SettingsPayload = {
  maintenanceMode: false,
  alertEmail: "",
  theme: "system",
  notifications: "all",
};

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings = defaultSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const [form, setForm] = useState<SettingsPayload>(defaultSettings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Config</h2>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Environment toggles and notification targets.
        </p>
      </div>

      <Card className="glass-panel tech-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Runtime settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4">
                <div>
                  <Label className="text-sm font-medium">Maintenance mode</Label>
                  <p className="text-xs text-muted-foreground">Toggle to place the console in maintenance.</p>
                </div>
                <Switch
                  checked={!!form.maintenanceMode}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertEmail">Alert email</Label>
                <Input
                  id="alertEmail"
                  type="email"
                  placeholder="ops@example.com"
                  value={form.alertEmail || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, alertEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={form.theme}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, theme: value as SettingsPayload["theme"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notifications</Label>
                <Select
                  value={form.notifications}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, notifications: value as SettingsPayload["notifications"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All events</SelectItem>
                    <SelectItem value="critical">Critical only</SelectItem>
                    <SelectItem value="none">Mute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={mutation.isLoading}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
