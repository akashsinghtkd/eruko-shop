"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { AuditLog } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";

export default function AuditLogsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<AuditLog[]>("audit-logs", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Audit Logs</h1>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<AuditLog>
          keyField="id"
          data={items}
          isLoading={loading}
          emptyMessage="No audit log entries."
          columns={[
            { key: "action", header: "Action" },
            { key: "resourceType", header: "Resource", render: (a) => a.resourceType ?? "—" },
            { key: "resourceId", header: "Resource ID", render: (a) => a.resourceId ?? "—" },
            {
              key: "createdAt",
              header: "Date",
              render: (a) =>
                a.createdAt ? new Date(a.createdAt).toLocaleString() : "—",
            },
            {
              key: "actions",
              header: "Details",
              render: (a) => (
                <button
                  type="button"
                  onClick={() => setDetail(a)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Audit log entry"
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-slate-600">ID:</span> {detail.id}</p>
            <p><span className="font-medium text-slate-600">Action:</span> {detail.action}</p>
            <p><span className="font-medium text-slate-600">Resource:</span> {detail.resourceType ?? "—"} / {detail.resourceId ?? "—"}</p>
            <p><span className="font-medium text-slate-600">User ID:</span> {detail.userId ?? "—"}</p>
            <p><span className="font-medium text-slate-600">Date:</span> {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}</p>
            {detail.payload != null && (
              <div>
                <span className="font-medium text-slate-600">Payload:</span>
                <pre className="mt-1 overflow-auto rounded bg-slate-100 p-2 text-xs">
                  {JSON.stringify(detail.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
