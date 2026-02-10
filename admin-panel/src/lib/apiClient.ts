const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export type ApiResponse<T> = { data: T; meta?: { total: number; page: number; limit: number } };

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<ApiResponse<T>> {
  const { token, ...init } = options;
  const url = `${getBaseUrl().replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json?.message || json?.error || res.statusText || "Request failed";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return json as ApiResponse<T>;
}

export function getApiUrl(path: string): string {
  return `${getBaseUrl().replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
