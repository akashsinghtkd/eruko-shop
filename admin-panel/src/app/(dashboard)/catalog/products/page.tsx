"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Product } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    brandId: "",
    description: "",
    status: "draft" as Product["status"],
    categoryIds: [] as string[],
    primaryMediaId: "",
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Product[]>("products", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
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
      sku: "",
      brandId: "",
      description: "",
      status: "draft",
      categoryIds: [],
      primaryMediaId: "",
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      brandId: p.brandId || "",
      description: p.description || "",
      status: p.status || "draft",
      categoryIds: p.categoryIds || [],
      primaryMediaId: p.primaryMediaId || "",
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
      sku: form.sku || undefined,
      brandId: form.brandId || undefined,
      description: form.description || undefined,
      status: form.status,
      categoryIds: form.categoryIds.length ? form.categoryIds : undefined,
      primaryMediaId: form.primaryMediaId || undefined,
    };
    try {
      if (editing) {
        await apiRequest(`products/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest("products", {
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
    if (!token || !confirm("Soft-delete this product?")) return;
    try {
      await apiRequest(`products/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleRestore = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`products/${id}/restore`, { method: "POST", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    }
  };

  const handleStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      await apiRequest(`products/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
        token,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
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
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        <Button onClick={openCreate}>Add product</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Product>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "name", header: "Name" },
            { key: "slug", header: "Slug" },
            {
              key: "status",
              header: "Status",
              render: (p) => (
                <span className="capitalize">{p.status || "draft"}</span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (p) => (
                <span className="flex flex-wrap gap-2">
                  <Link
                    href={`/catalog/products/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Variants
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  {p.status !== "active" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(p.id, "active")}
                      className="text-green-600 hover:underline"
                    >
                      Publish
                    </button>
                  )}
                  {p.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(p.id, "archived")}
                      className="text-amber-600 hover:underline"
                    >
                      Archive
                    </button>
                  )}
                  {p.deletedAt != null ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(p.id)}
                      className="text-green-600 hover:underline"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
        title={editing ? "Edit product" : "New product"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="product-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
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
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
          <Input
            label="Brand ID"
            value={form.brandId}
            onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as Product["status"],
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <Input
            label="Primary media ID"
            value={form.primaryMediaId}
            onChange={(e) => setForm((f) => ({ ...f, primaryMediaId: e.target.value }))}
          />
        </form>
      </Modal>
    </div>
  );
}
