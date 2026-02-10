"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Review } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function ReviewsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [statusModal, setStatusModal] = useState<Review | null>(null);
  const [statusValue, setStatusValue] = useState("");
  const [form, setForm] = useState({
    productId: "",
    userId: "",
    rating: "5",
    title: "",
    body: "",
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Review[]>("reviews", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ productId: "", userId: "", rating: "5", title: "", body: "" });
    setModalOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({
      productId: r.productId || "",
      userId: r.userId || "",
      rating: String(r.rating ?? 5),
      title: r.title || "",
      body: r.body || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const payload = {
      productId: form.productId || undefined,
      userId: form.userId || undefined,
      rating: parseInt(form.rating, 10) || 5,
      title: form.title || undefined,
      body: form.body || undefined,
    };
    try {
      if (editing) {
        await apiRequest(`reviews/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiRequest("reviews", {
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

  const handleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !statusModal) return;
    setError("");
    try {
      await apiRequest(`reviews/${statusModal.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: statusValue }),
        token,
      });
      setStatusModal(null);
      setStatusValue("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this review?")) return;
    try {
      await apiRequest(`reviews/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Reviews</h1>
        <Button onClick={openCreate}>Add review</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Review>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "rating", header: "Rating" },
            { key: "title", header: "Title", render: (r) => r.title ?? "—" },
            { key: "status", header: "Status", render: (r) => r.status ?? "—" },
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
                    onClick={() => {
                      setStatusModal(r);
                      setStatusValue(r.status || "pending");
                    }}
                    className="text-amber-600 hover:underline"
                  >
                    Status
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
        title={editing ? "Edit review" : "New review"}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="review-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product ID"
            value={form.productId}
            onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
          />
          <Input
            label="User ID"
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          />
          <Input
            label="Rating (1-5)"
            type="number"
            min="1"
            max="5"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
              rows={3}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!statusModal}
        onClose={() => { setStatusModal(null); setStatusValue(""); }}
        title="Change review status"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => { setStatusModal(null); setStatusValue(""); }}>
              Cancel
            </Button>
            <Button type="submit" form="status-form">
              Update
            </Button>
          </>
        }
      >
        <form id="status-form" onSubmit={handleStatus} className="space-y-4">
          <Input
            label="Status"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            placeholder="e.g. approved, rejected, pending"
          />
        </form>
      </Modal>
    </div>
  );
}
