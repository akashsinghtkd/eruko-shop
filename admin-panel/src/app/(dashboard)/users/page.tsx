"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { User } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function UsersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    isActive: true,
    roleIds: [] as string[],
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<User[]>("users", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: "", fullName: "", isActive: true, roleIds: [] });
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      email: u.email,
      fullName: u.fullName || "",
      isActive: u.isActive !== false,
      roleIds: u.roleIds || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const payload = {
      email: form.email,
      fullName: form.fullName || undefined,
      isActive: form.isActive,
      roleIds: form.roleIds.length ? form.roleIds : undefined,
    };
    try {
      if (editing) {
        await apiRequest(`users/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest("users", {
          method: "POST",
          body: JSON.stringify(payload),
          token,
        });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleStatus = async (id: string, isActive: boolean) => {
    if (!token) return;
    try {
      await apiRequest(`users/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ isActive }),
        token,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Soft-delete this user?")) return;
    try {
      await apiRequest(`users/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <Button onClick={openCreate}>Add user</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<User>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "email", header: "Email" },
            { key: "fullName", header: "Name", render: (u) => u.fullName ?? "—" },
            {
              key: "isActive",
              header: "Active",
              render: (u) => (u.isActive !== false ? "Yes" : "No"),
            },
            {
              key: "actions",
              header: "Actions",
              render: (u) => (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatus(u.id, !(u.isActive !== false))}
                    className="text-amber-600 hover:underline"
                  >
                    {u.isActive !== false ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
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
        title={editing ? "Edit user" : "New user"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            disabled={!!editing}
          />
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="user-active"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="user-active" className="text-sm text-slate-700">
              Active
            </label>
          </div>
          <Input
            label="Role IDs (comma-separated UUIDs)"
            value={form.roleIds.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                roleIds: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
