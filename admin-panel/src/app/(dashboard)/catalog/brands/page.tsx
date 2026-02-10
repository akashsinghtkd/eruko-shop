"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import { canRead, canWrite } from "@/lib/permissions";
import type { Brand } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { NotAuthorized } from "@/components/auth/NotAuthorized";

export default function BrandsPage() {
  const { token, user } = useAuth();
  const permissions = user?.permissions;
  const allowedRead = canRead(permissions, "brands");
  const allowedWrite = canWrite(permissions, "brands");
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Brand[]>("brands", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({
      name: b.name,
      slug: b.slug,
      description: b.description || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editing) {
        await apiRequest(`brands/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
          token,
        });
      } else {
        await apiRequest("brands", {
          method: "POST",
          body: JSON.stringify(form),
          token,
        });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Soft-delete this brand?")) return;
    try {
      await apiRequest(`brands/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleRestore = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`brands/${id}/restore`, { method: "POST", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    }
  };

  const slugFromName = (name: string) =>
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  if (!allowedRead) {
    return <NotAuthorized resource="brands" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Brands</h1>
        {allowedWrite && <Button onClick={openCreate}>Add brand</Button>}
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Brand>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "name", header: "Name" },
            { key: "slug", header: "Slug" },
            {
              key: "isActive",
              header: "Active",
              render: (b) => (b.isActive !== false ? "Yes" : "No"),
            },
            ...(allowedWrite
              ? [
                  {
                    key: "actions",
                    header: "Actions",
                    render: (b: Brand) => (
                      <span className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {b.deletedAt != null ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(b.id)}
                            className="text-green-600 hover:underline"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit brand" : "New brand"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="brand-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="brand-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: editing ? f.slug : slugFromName(e.target.value),
              }));
            }}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </form>
      </Modal>
    </div>
  );
}
