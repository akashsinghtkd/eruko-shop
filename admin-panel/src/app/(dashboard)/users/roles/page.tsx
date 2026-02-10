"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Role, Permission } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function RolesPage() {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [permsModalOpen, setPermsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [rolePerms, setRolePerms] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
  });

  const loadRoles = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest<Role[]>("rbac/roles", { token });
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRoles([]);
    }
  }, [token]);

  const loadPermissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest<Permission[]>("rbac/permissions", { token });
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPermissions([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([loadRoles(), loadPermissions()]).finally(() => setLoading(false));
  }, [token, loadRoles, loadPermissions]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", displayName: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setForm({
      name: r.name,
      displayName: (r as { displayName?: string }).displayName || "",
      description: r.description || "",
    });
    setModalOpen(true);
  };

  const openPerms = async (r: Role) => {
    setRolePerms(r);
    setSelectedPermIds([]);
    try {
      const res = await apiRequest<Permission[]>(`rbac/roles/${r.id}/permissions`, { token: token! });
      const list = Array.isArray(res.data) ? res.data : [];
      setSelectedPermIds(list.map((p) => p.id));
    } catch {
      setSelectedPermIds([]);
    }
    setPermsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const payload = {
      name: form.name,
      displayName: form.displayName || undefined,
      description: form.description || undefined,
    };
    try {
      if (editing) {
        await apiRequest(`rbac/roles/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest("rbac/roles", {
          method: "POST",
          body: JSON.stringify(payload),
          token,
        });
      }
      setModalOpen(false);
      loadRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleSavePerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !rolePerms) return;
    setError("");
    try {
      await apiRequest(`rbac/roles/${rolePerms.id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissionIds: selectedPermIds }),
        token,
      });
      setPermsModalOpen(false);
      setRolePerms(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update permissions");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this role?")) return;
    try {
      await apiRequest(`rbac/roles/${id}`, { method: "DELETE", token });
      loadRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const togglePerm = (id: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Roles & Permissions</h1>
        <Button onClick={openCreate}>Add role</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Role>
          keyField="id"
          data={roles}
          isLoading={loading}
          columns={[
            { key: "name", header: "Name" },
            { key: "description", header: "Description", render: (r) => r.description ?? "—" },
            {
              key: "actions",
              header: "Actions",
              render: (r) => (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openPerms(r)}
                    className="text-green-600 hover:underline"
                  >
                    Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </span>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit role" : "New role"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="role-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Display name"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={permsModalOpen}
        onClose={() => { setPermsModalOpen(false); setRolePerms(null); }}
        title={rolePerms ? `Permissions: ${rolePerms.name}` : "Permissions"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => { setPermsModalOpen(false); setRolePerms(null); }}>
              Cancel
            </Button>
            <Button type="submit" form="perms-form">
              Save
            </Button>
          </>
        }
      >
        <form id="perms-form" onSubmit={handleSavePerms} className="space-y-2">
          <p className="text-sm text-slate-600 mb-2">Select permissions for this role:</p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {permissions.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermIds.includes(p.id)}
                  onChange={() => togglePerm(p.id)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">
                  {(p as { name?: string }).name ?? `${(p as { resource?: string }).resource}:${(p as { action?: string }).action}`}
                </span>
              </label>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}
