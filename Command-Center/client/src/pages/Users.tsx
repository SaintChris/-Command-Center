import { useState, useEffect, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, fetchUsers, updateUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User } from "@shared/schema";

const emptyForm = { username: "", password: "" };

export default function Users() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<User, "username" | "password">> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setForm(emptyForm);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  useEffect(() => {
    if (!editingId) return;
    const user = users.find((u) => u.id === editingId);
    if (user) {
      setForm({ username: user.username, password: "" });
    }
  }, [editingId, users]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) return;

    if (editingId) {
      const payload: Partial<User> = { username: form.username };
      if (form.password) payload.password = form.password;
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate({ username: form.username, password: form.password });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Manage operators directly from the console.
          </p>
        </div>
      </div>

      <Card className="glass-panel tech-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">{editingId ? "Edit user" : "Add user"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              placeholder={editingId ? "new password (optional)" : "password"}
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" className="w-full" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {editingId ? "Save changes" : "Create user"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel tech-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">
                      No users yet. Add one above.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">••••••</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(user.id)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
