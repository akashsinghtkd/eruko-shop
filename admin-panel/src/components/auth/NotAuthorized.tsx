"use client";

export function NotAuthorized({ resource = "this resource" }: { resource?: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="font-medium text-amber-800">You don’t have permission to access {resource}.</p>
      <p className="mt-1 text-sm text-amber-700">Contact an administrator to request access.</p>
    </div>
  );
}
