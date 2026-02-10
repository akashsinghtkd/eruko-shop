"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { InventoryItem } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function InventoryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    variantId: "",
    warehouseId: "",
    change: "",
    reason: "",
    note: "",
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<InventoryItem[]>("inventory", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const change = parseInt(adjustForm.change, 10);
    if (Number.isNaN(change)) {
      setError("Change must be a number");
      return;
    }
    try {
      await apiRequest("inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          variantId: adjustForm.variantId,
          warehouseId: adjustForm.warehouseId || undefined,
          change,
          reason: adjustForm.reason,
          note: adjustForm.note || undefined,
        }),
        token,
      });
      setAdjustOpen(false);
      setAdjustForm({ variantId: "", warehouseId: "", change: "", reason: "", note: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Adjust failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Inventory</h1>
        <Button onClick={() => setAdjustOpen(true)}>Adjust inventory</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<InventoryItem & { id?: string }>
          keyField={(item) => item.variantId + (item.warehouseId ?? "default")}
          data={items}
          isLoading={loading}
          emptyMessage="No inventory records. Use Adjust to add stock."
          columns={[
            { key: "variantId", header: "Variant ID" },
            { key: "warehouseId", header: "Warehouse ID", render: (i) => i.warehouseId ?? "—" },
            {
              key: "quantity",
              header: "Quantity",
              render: (i) => String((i as { quantity?: number }).quantity ?? 0),
            },
          ]}
        />
      </div>

      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust inventory"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="adjust-form">
              Apply
            </Button>
          </>
        }
      >
        <form id="adjust-form" onSubmit={handleAdjust} className="space-y-4">
          <Input
            label="Variant ID"
            value={adjustForm.variantId}
            onChange={(e) => setAdjustForm((f) => ({ ...f, variantId: e.target.value }))}
            required
          />
          <Input
            label="Warehouse ID (optional)"
            value={adjustForm.warehouseId}
            onChange={(e) => setAdjustForm((f) => ({ ...f, warehouseId: e.target.value }))}
          />
          <Input
            label="Change (+ or - quantity)"
            type="number"
            value={adjustForm.change}
            onChange={(e) => setAdjustForm((f) => ({ ...f, change: e.target.value }))}
            required
          />
          <Input
            label="Reason"
            value={adjustForm.reason}
            onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
            required
          />
          <Input
            label="Note (optional)"
            value={adjustForm.note}
            onChange={(e) => setAdjustForm((f) => ({ ...f, note: e.target.value }))}
          />
        </form>
      </Modal>
    </div>
  );
}
