"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, RefreshCw, Shield, Loader2 } from "lucide-react";

const TYPES = [
  { key: "site", label: "Sites" },
  { key: "incidentArea", label: "Incident Areas" },
  { key: "incidentCategory", label: "Incident Categories" },
  { key: "shift", label: "Shifts" },
  { key: "severity", label: "Severities" },
  { key: "personnelType", label: "Personnel Types" },
  { key: "injuryArea", label: "Injury Areas" },
  { key: "operationalCategory", label: "Operational Categories" },
  { key: "currency", label: "Currencies" },
];

const USER_ROLES = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

type Item = { id: string; value: string; label: string; order?: number | null };

type Grouped = Record<string, Item[]>;

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Grouped>({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; username: string; name: string | null; email: string | null; role: string }>>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      toast("Admins only");
      router.push("/dashboard");
      return;
    }
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  async function load() {
    setLoading(true);
    try {
      const qs = TYPES.map(t => t.key).join(",");
      const res = await fetch(`/api/lookups?types=${encodeURIComponent(qs)}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.items || {});
      const usersRes = await fetch('/api/admin/users', { credentials: 'include' });
      const usersData = await usersRes.json();
      setUsers(usersData.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(type: string, value: string, label: string, order?: number) {
    await toast.promise(
      (async () => {
        const res = await fetch("/api/lookups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type, value, label, order }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to add item");
        }
      })(),
      { loading: "Adding...", success: "Added", error: (e) => String(e.message || e) }
    );
    await load();
  }

  async function delItem(id: string) {
    await toast.promise(
      (async () => {
        const res = await fetch(`/api/lookups/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to delete item");
        }
      })(),
      { loading: "Deleting...", success: "Deleted", error: (e) => String(e.message || e) }
    );
    await load();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">Manage dropdown options, users, and defaults.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <RefreshCw className="size-4 mr-1" />} Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue={TYPES[0].key}>
        <TabsList className="flex w-full overflow-x-auto gap-2">
          {TYPES.map(t => (
            <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
          ))}
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Lookup tabs */}
        {TYPES.map(t => (
          <TabsContent key={t.key} value={t.key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.label}</CardTitle>
                <CardDescription>Add or remove options for {t.label.toLowerCase()}.</CardDescription>
              </CardHeader>
              <CardContent>
                <AddForm type={t.key} onAdd={addItem} />
                <div className="mt-4">
                  {(!items[t.key] || items[t.key].length === 0) ? (
                    <div className="p-2 text-sm text-muted-foreground">No items yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Value</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(items[t.key] || []).map((it) => (
                          <TableRow key={it.id}>
                            <TableCell className="font-mono text-muted-foreground">{it.value}</TableCell>
                            <TableCell>{it.label}</TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="size-4 mr-1" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{it.label}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => void delItem(it.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Users tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Create new users and assign roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm onCreated={load} />
              <div className="mt-4 relative w-full overflow-x-auto">
                {users.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No users found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px] whitespace-nowrap">Username</TableHead>
                        <TableHead className="min-w-[180px]">Name</TableHead>
                        <TableHead className="min-w-[220px]">Email</TableHead>
                        <TableHead className="w-[160px]">Role</TableHead>
                        <TableHead className="min-w-[200px]">New password</TableHead>
                        <TableHead className="w-[180px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <UserRowTr key={u.id} user={u} onChanged={load} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

type UserLite = { id: string; username: string; name: string | null; email: string | null; role: string };

function UserRowTr({ user, onChanged }: { user: UserLite; onChanged: () => Promise<void> }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "USER");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [routes, setRoutes] = useState<Array<{ id: string; path: string; isPrefix: boolean }>>([]);
  const [newPath, setNewPath] = useState("");
  const [newPrefix, setNewPrefix] = useState(true);

  async function save() {
    setSaving(true);
    try {
      await toast.promise(
        (async () => {
          const payload: any = { name: name || null, email: email || null, role };
          if (password) payload.password = password;
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.error || 'Failed to save');
          }
        })(),
        { loading: 'Saving...', success: 'Saved', error: (e) => String(e.message || e) }
      );
      setPassword("");
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    setDeleting(true);
    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE', credentials: 'include' });
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.error || 'Failed to delete');
          }
        })(),
        { loading: 'Deleting...', success: 'Deleted', error: (e) => String(e.message || e) }
      );
      await onChanged();
    } finally {
      setDeleting(false);
    }
  }

  async function loadRoutes() {
    const res = await fetch(`/api/admin/users/${user.id}/routes`, { credentials: 'include' });
    const data = await res.json();
    setRoutes(data.items || []);
  }

  async function addRoute() {
    if (!newPath) return;
    await toast.promise(
      (async () => {
        const res = await fetch(`/api/admin/users/${user.id}/routes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ path: newPath, isPrefix: newPrefix })
        });
        if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || 'Failed to add route'); }
      })(),
      { loading: 'Adding route...', success: 'Route added', error: (e) => String(e.message || e) }
    );
    setNewPath(''); setNewPrefix(true); await loadRoutes();
  }

  async function deleteRoute(id: string) {
    await toast.promise(
      (async () => {
        const res = await fetch(`/api/admin/user-routes/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || 'Failed to delete route'); }
      })(),
      { loading: 'Deleting route...', success: 'Route deleted', error: (e) => String(e.message || e) }
    );
    await loadRoutes();
  }

  return (
    <TableRow>
      <TableCell className="w-[160px] whitespace-nowrap font-medium">{user.username}</TableCell>
      <TableCell className="min-w-[180px]">
        <Input className="h-9" value={name} onChange={e => setName(e.target.value)} />
      </TableCell>
      <TableCell className="min-w-[220px]">
        <Input className="h-9" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </TableCell>
      <TableCell className="w-[160px]">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[200px]">
        <Input className="h-9" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep" />
      </TableCell>
      <TableCell className="w-[220px] text-right whitespace-nowrap">
        <Button variant="outline" size="sm" onClick={save} disabled={saving}><Save className="size-4 mr-1" /> Save</Button>
        <Dialog open={accessOpen} onOpenChange={(o) => { setAccessOpen(o); if (o) void loadRoutes(); }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2"><Shield className="size-4 mr-1" /> Access</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>Route access for {user.username}</DialogTitle>
              <DialogDescription>Allow this user to access specific paths. Admins automatically have access to all routes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-[1fr_140px_120px]">
                <div>
                  <Label htmlFor="route-path">Path</Label>
                  <Input id="route-path" placeholder="e.g. /dashboard/capa" value={newPath} onChange={e => setNewPath(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="is-prefix" checked={newPrefix} onCheckedChange={setNewPrefix} />
                    <Label htmlFor="is-prefix">Prefix match</Label>
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <Button onClick={() => void addRoute()}><Plus className="size-4 mr-1" /> Add</Button>
                </div>
              </div>
              <div className="relative w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Path</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.path}</TableCell>
                        <TableCell className="text-xs">{r.isPrefix ? 'Prefix' : 'Exact'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => void deleteRoute(r.id)}><Trash2 className="size-4 mr-1" /> Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {routes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-sm text-muted-foreground">No routes yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAccessOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2" disabled={deleting}><Trash2 className="size-4 mr-1" /> Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete user "{user.username}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void del()}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, name: name || undefined, email: email || undefined, role })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || 'Failed to create user');
        return;
      }
      toast('User created');
      setUsername(''); setPassword(''); setName(''); setEmail(''); setRole('USER');
      await onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_160px]" onSubmit={submit}>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-5 flex justify-end">
        <Button type="submit" disabled={submitting}><Plus className="size-4 mr-1" /> {submitting ? 'Creating...' : 'Create user'}</Button>
      </div>
    </form>
  );
}

function AddForm({ type, onAdd }: { type: string; onAdd: (type: string, value: string, label: string, order?: number) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [order, setOrder] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value || !label) return;
    setSubmitting(true);
    try {
      await onAdd(type, value, label, order ? Number(order) : undefined);
      setValue(""); setLabel(""); setOrder("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-2 md:grid-cols-[1fr_1fr_120px_120px]" onSubmit={submit}>
      <div>
        <Label htmlFor={`value-${type}`}>Value</Label>
        <Input id={`value-${type}`} value={value} onChange={e => setValue(e.target.value)} placeholder="machine-readable" required />
      </div>
      <div>
        <Label htmlFor={`label-${type}`}>Label</Label>
        <Input id={`label-${type}`} value={label} onChange={e => setLabel(e.target.value)} placeholder="Human readable" required />
      </div>
      <div>
        <Label htmlFor={`order-${type}`}>Order</Label>
        <Input id={`order-${type}`} value={order} onChange={e => setOrder(e.target.value)} placeholder="e.g. 1" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add"}</Button>
      </div>
    </form>
  );
}