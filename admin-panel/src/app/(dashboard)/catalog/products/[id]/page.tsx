"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Product, Variant } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    status: "active" as Variant["status"],
  });

  const loadProduct = useCallback(async () => {
    if (!token || !productId) return;
    try {
      const res = await apiRequest<Product>(`products/${productId}`, { token });
      setProduct(res.data);
    } catch {
      setProduct(null);
    }
  }, [token, productId]);

  const loadVariants = useCallback(async () => {
    if (!token || !productId) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Variant[]>(
        `products/${productId}/variants`,
        { token }
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load variants");
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const setItems = (v: Variant[]) => setVariants(v);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sku: "", price: "", status: "active" });
    setModalOpen(true);
  };

  const openEdit = (v: Variant) => {
    setEditing(v);
    setForm({
      name: v.name,
      sku: v.sku,
      price: String(v.price),
      status: v.status || "active",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !productId) return;
    setError("");
    const payload = {
      name: form.name,
      sku: form.sku,
      productId,
      price: parseFloat(form.price) || 0,
      status: form.status,
    };
    try {
      if (editing) {
        await apiRequest(`variants/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest(`products/${productId}/variants`, {
          method: "POST",
          body: JSON.stringify(payload),
          token,
        });
      }
      setModalOpen(false);
      loadVariants();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this variant?")) return;
    try {
      await apiRequest(`variants/${id}`, { method: "DELETE", token });
      loadVariants();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleRestore = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`variants/${id}/restore`, { method: "POST", token });
      loadVariants();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    }
  };

  if (product === undefined) return null;
  if (product === null && !loading) {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
        Product not found. <Link href="/catalog/products" className="underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Link href="/catalog/products" className="text-slate-600 hover:underline">
          Products
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-medium text-slate-800">{product?.name ?? productId}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Variants</h1>
        <Button onClick={openCreate}>Add variant</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Variant>
          keyField="id"
          data={variants}
          isLoading={loading}
          columns={[
            { key: "name", header: "Name" },
            { key: "sku", header: "SKU" },
            {
              key: "price",
              header: "Price",
              render: (v) => (typeof v.price === "number" ? `$${v.price.toFixed(2)}` : String(v.price)),
            },
            {
              key: "status",
              header: "Status",
              render: (v) => <span className="capitalize">{v.status || "active"}</span>,
            },
            {
              key: "actions",
              header: "Actions",
              render: (v) => (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  {v.deletedAt != null ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(v.id)}
                      className="text-green-600 hover:underline"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
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
        title={editing ? "Edit variant" : "New variant"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="variant-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="variant-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            required
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as Variant["status"] }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
