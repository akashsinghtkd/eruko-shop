"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";
import type { MediaAsset } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function MediaPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [associateOpen, setAssociateOpen] = useState<MediaAsset | null>(null);
  const [uploadForm, setUploadForm] = useState({
    bucket: "media",
    fileName: "",
    mimeType: "image/jpeg",
    fileSize: "",
  });
  const [associateForm, setAssociateForm] = useState({ linkedType: "", linkedId: "" });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<MediaAsset[]>("media", { token });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGetUploadUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    const fileSize = parseInt(uploadForm.fileSize, 10);
    if (Number.isNaN(fileSize) || fileSize <= 0) {
      setError("File size must be a positive number");
      return;
    }
    try {
      const res = await apiRequest<{ uploadUrl: string; asset: MediaAsset }>("media/upload-url", {
        method: "POST",
        body: JSON.stringify({
          bucket: uploadForm.bucket,
          fileName: uploadForm.fileName,
          mimeType: uploadForm.mimeType,
          fileSize,
        }),
        token,
      });
      const data = res.data as { uploadUrl: string; asset: MediaAsset };
      setUploadOpen(false);
      setUploadForm({ bucket: "media", fileName: "", mimeType: "image/jpeg", fileSize: "" });
      if (data.uploadUrl) {
        window.alert(`Upload URL generated. Use this URL to upload the file (e.g. PUT request). Asset ID: ${(data.asset as { id?: string })?.id ?? "—"}`);
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get upload URL");
    }
  };

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !associateOpen) return;
    setError("");
    try {
      await apiRequest(`media/${associateOpen.id}/associate`, {
        method: "POST",
        body: JSON.stringify(associateForm),
        token,
      });
      setAssociateOpen(null);
      setAssociateForm({ linkedType: "", linkedId: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Associate failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this media?")) return;
    try {
      await apiRequest(`media/${id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Media</h1>
        <Button onClick={() => setUploadOpen(true)}>Get upload URL</Button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4">
        <DataTable<MediaAsset>
          keyField="id"
          data={items}
          isLoading={loading}
          columns={[
            { key: "fileName", header: "File name", render: (m) => m.fileName || m.path || m.id },
            { key: "bucket", header: "Bucket" },
            { key: "mimeType", header: "Type", render: (m) => m.mimeType ?? "—" },
            {
              key: "linked",
              header: "Linked",
              render: (m) =>
                m.linkedType && m.linkedId
                  ? `${m.linkedType}:${m.linkedId}`
                  : "—",
            },
            {
              key: "actions",
              header: "Actions",
              render: (m) => (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssociateOpen(m);
                      setAssociateForm({ linkedType: "", linkedId: "" });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Associate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
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
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Get upload URL"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="upload-form">
              Generate URL
            </Button>
          </>
        }
      >
        <form id="upload-form" onSubmit={handleGetUploadUrl} className="space-y-4">
          <Input
            label="Bucket"
            value={uploadForm.bucket}
            onChange={(e) => setUploadForm((f) => ({ ...f, bucket: e.target.value }))}
            required
          />
          <Input
            label="File name"
            value={uploadForm.fileName}
            onChange={(e) => setUploadForm((f) => ({ ...f, fileName: e.target.value }))}
            required
          />
          <Input
            label="MIME type"
            value={uploadForm.mimeType}
            onChange={(e) => setUploadForm((f) => ({ ...f, mimeType: e.target.value }))}
          />
          <Input
            label="File size (bytes)"
            type="number"
            value={uploadForm.fileSize}
            onChange={(e) => setUploadForm((f) => ({ ...f, fileSize: e.target.value }))}
            required
          />
        </form>
      </Modal>

      <Modal
        open={!!associateOpen}
        onClose={() => setAssociateOpen(null)}
        title="Associate media"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setAssociateOpen(null)}>
              Cancel
            </Button>
            <Button type="submit" form="associate-form">
              Associate
            </Button>
          </>
        }
      >
        <form id="associate-form" onSubmit={handleAssociate} className="space-y-4">
          <Input
            label="Linked type (e.g. product, brand)"
            value={associateForm.linkedType}
            onChange={(e) => setAssociateForm((f) => ({ ...f, linkedType: e.target.value }))}
            required
          />
          <Input
            label="Linked ID"
            value={associateForm.linkedId}
            onChange={(e) => setAssociateForm((f) => ({ ...f, linkedId: e.target.value }))}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
