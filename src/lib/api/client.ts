/**
 * Centralized API client for Medal Archive Pro.
 * All requests go through this module.
 */

import type { ApiErrorBody } from "@/types/api";

/**
 * API origin.
 * - Empty / unset → same-origin `/api/...` via Next.js rewrite → Django (no CORS in dev).
 * - Full URL (NEXT_PUBLIC_API_URL) → direct calls (backend must allow CORS).
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type TokenGetter = () => string | null;
type TokenClearer = () => void;

let getAccessToken: TokenGetter = () => null;
let clearTokens: TokenClearer = () => {};

/**
 * Wire token helpers from the auth store (called once at app bootstrap).
 */
export function configureAuthHandlers(
  getter: TokenGetter,
  clearer: TokenClearer
) {
  getAccessToken = getter;
  clearTokens = clearer;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip attaching Authorization header */
  skipAuth?: boolean;
  /** Return raw Response (for PDF / blob downloads) */
  raw?: boolean;
}

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, raw = false, headers: customHeaders, ...rest } =
    options;

  const headers = new Headers(customHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(0, "خطا در ارتباط با سرور. اتصال اینترنت را بررسی کنید.");
  }

  if (raw) {
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}`);
    }
    return response as unknown as T;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const bodyObj = (data as ApiErrorBody) || null;
    let message = `خطای ${response.status}`;
    if (bodyObj && typeof bodyObj === "object") {
      if (typeof bodyObj.detail === "string" && bodyObj.detail.trim()) {
        message = bodyObj.detail;
      } else if (Array.isArray(bodyObj.detail)) {
        message = bodyObj.detail.map(String).join(" ");
      } else {
        const fieldMsgs: string[] = [];
        for (const [k, v] of Object.entries(bodyObj)) {
          if (k === "detail") continue;
          if (Array.isArray(v)) fieldMsgs.push(v.map(String).join(" "));
          else if (typeof v === "string") fieldMsgs.push(v);
        }
        if (fieldMsgs.length) message = fieldMsgs.join(" ");
      }
    }

    // 401 on authenticated calls → clear session (not on login/skipAuth)
    if (response.status === 401 && !skipAuth) {
      clearTokens();
    }

    throw new ApiError(response.status, String(message), bodyObj);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),

  /** For multipart uploads */
  postForm: <T = unknown>(path: string, formData: FormData, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: formData }),

  /** For binary downloads (PDF etc.) */
  getBlob: async (path: string, options?: RequestOptions): Promise<Blob> => {
    const res = await request<Response>(path, { ...options, method: "GET", raw: true });
    return res.blob();
  },
};

export { API_BASE };
