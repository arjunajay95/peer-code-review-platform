/**
 * Typed API client (A-09, D-22).
 * Every call to the backend goes through here.
 * Authenticated calls attach the Clerk session token as a Bearer header.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

let _getToken: (() => Promise<string | null>) | null = null;

export function initApiClient(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T>;

  if (!body.success) throw new Error(body.error.message ?? "API error");
  return body;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
};
