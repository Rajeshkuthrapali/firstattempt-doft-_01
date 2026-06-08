const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// In-memory token storage (set by auth store)
let accessToken: string | null = null;

// --- CSRF Token Support ---
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/csrf-token`);
    if (!res.ok) return null;
    const data = await res.json();
    csrfToken = data.csrfToken ?? null;
    return csrfToken;
  } catch {
    return null;
  }
}

// Fetch CSRF token on module init (fails silently if server is down)
fetchCsrfToken();

// --- Refresh Token Support ---
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // Coalesce concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
        return false;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return true;
    } catch {
      setAccessToken(null);
      localStorage.removeItem("refreshToken");
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    super(`API Error: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  let lastErrorBody: any = {};

  for (let attempt = 0; attempt < 2; attempt++) {
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    if (csrfToken && isMutation) {
      headers["x-csrf-token"] = csrfToken;
    }

    const options: RequestInit = { method, headers };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${path}`, options);

    if (res.ok) {
      return res.json() as Promise<T>;
    }

    lastErrorBody = await res.json().catch(() => ({}));

    // 401 — attempt token refresh once
    if (res.status === 401 && attempt === 0) {
      const refreshed = await refreshAccessToken();
      if (refreshed) continue;
      throw new ApiError(401, lastErrorBody);
    }

    // 403 — re-fetch CSRF token and retry once
    if (res.status === 403 && attempt === 0) {
      await fetchCsrfToken();
      continue;
    }

    throw new ApiError(res.status, lastErrorBody);
  }

  throw new Error("Unreachable");
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
