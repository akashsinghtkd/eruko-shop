"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Category } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function CategoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Category[]>("categories", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      parentId: "",
      isActive: true,
      sortOrder: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId || "",
      isActive: c.isActive !== false,
      sortOrder: c.sortOrder ?? 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug,
      parentId: form.parentId || undefined,
      isActive: form.isActive,
      sortOrder: form.sortOrder,
    };
    try {
      if (editing) {
        await apiRequest(`categories/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest("categories", {
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

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Soft-delete this category?")) return;
    try {
      await apiRequest(`categories/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleRestore = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`categories/${id}/restore`, { method: "POST", token });
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        <Button onClick={openCreate}>Add category</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Category>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "name", header: "Name" },
            { key: "slug", header: "Slug" },
            {
              key: "isActive",
              header: "Active",
              render: (c) => (c.isActive !== false ? "Yes" : "No"),
            },
            {
              key: "actions",
              header: "Actions",
              render: (c) => (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  {c.deletedAt != null ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(c.id)}
                      className="text-green-600 hover:underline"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </span>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "New category"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: editing ? f.slug : slugFromName(e.target.value),
              }))
            }
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
          <Input
            label="Parent ID"
            value={form.parentId}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-active"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="cat-active" className="text-sm text-slate-700">
              Active
            </label>
          </div>
          <Input
            label="Sort order"
            type="number"
            value={String(form.sortOrder)}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
