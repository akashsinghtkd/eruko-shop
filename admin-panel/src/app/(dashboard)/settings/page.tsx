"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Setting } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [editValue, setEditValue] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<Setting[]>("settings", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (s: Setting) => {
    setEditingKey(s.key);
    setEditValue(
      typeof s.value === "object"
        ? JSON.stringify(s.value)
        : String(s.value)
    );
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    let value: string | number | boolean | object = editValue;
    if (editValue === "true") value = true;
    else if (editValue === "false") value = false;
    else if (/^\d+$/.test(editValue)) value = parseInt(editValue, 10);
    else if (editValue.startsWith("{")) {
      try {
        value = JSON.parse(editValue);
      } catch {
        // keep as string
      }
    }
    try {
      await apiRequest(`settings/${editingKey}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
        token,
      });
      setEditOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<Setting>
          keyField="key"
          data={items}
          isLoading={loading}
          columns={[
            { key: "key", header: "Key" },
            {
              key: "value",
              header: "Value",
              render: (s) =>
                typeof s.value === "object"
                  ? JSON.stringify(s.value)
                  : String(s.value),
            },
            {
              key: "actions",
              header: "Actions",
              render: (s) => (
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit: ${editingKey}`}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="setting-edit-form">
              Save
            </Button>
          </>
        }
      >
        <form id="setting-edit-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono text-sm"
              rows={4}
            />
            <p className="mt-1 text-xs text-slate-500">
              Use true/false for boolean, number, or JSON object.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
