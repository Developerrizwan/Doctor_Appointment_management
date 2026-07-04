import axios from "axios";

// Central axios instance for the whole app.
// Base URL points at the DRF API root; VITE_BACKEND_URL comes from .env.
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
});

// Storage keys.
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user";

// Tenant routing (T4). Tenant-scoped paths are served under /api/<slug>/…. The
// active hospital slug is learned at login and stored here; everything but the
// global /specialities catalog is prefixed with it. (URL-based slug routing is
// a later phase; for now the slug is a stored value.)
export const HOSPITAL_SLUG_KEY = "hospital_slug";
export const DEFAULT_HOSPITAL_SLUG = "demo-hospital";

// Tenancy is URL-based: the slug is the first path segment (/demo-hospital/…).
// Fall back to the last-used slug (for token refresh fired off-route) or the
// default. Frontend paths always start with the slug, so segment[0] is it.
export const getTenantSlug = () => {
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return seg || localStorage.getItem(HOSPITAL_SLUG_KEY) || DEFAULT_HOSPITAL_SLUG;
};

export const setTenantSlug = (slug) => {
  if (slug) localStorage.setItem(HOSPITAL_SLUG_KEY, slug.trim());
};

const TENANT_ROOTS = ["/doctors", "/appointments", "/dashboard", "/auth"];

const needsTenantPrefix = (url) => {
  if (!url || /^https?:\/\//i.test(url)) return false; // absolute (e.g. paginated next) → skip
  const slug = getTenantSlug();
  if (url.startsWith(`/${slug}/`)) return false; // already prefixed
  return TENANT_ROOTS.some(
    (root) =>
      url === root || url.startsWith(`${root}/`) || url.startsWith(`${root}?`)
  );
};

// Safely decode a JWT payload; returns null if the token is malformed.
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// A token is usable only if it's a well-formed, unexpired JWT.
// Anything else (empty, "undefined"/"null" strings, wrong shape, expired) is not.
export const isTokenUsable = (token) => {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;
  if (trimmed.split(".").length !== 3) return false;
  const payload = decodeJwtPayload(trimmed);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
};

// On load, purge any leftover invalid/expired access token so a stale value
// can't poison public requests (doctors, specialities), which must work with
// NO Authorization header at all.
const storedOnLoad = localStorage.getItem(ACCESS_TOKEN_KEY);
if (storedOnLoad !== null && !isTokenUsable(storedOnLoad)) {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Attach the JWT access token ONLY when a valid one actually exists.
// Otherwise send the request with no Authorization header (public endpoints).
api.interceptors.request.use((config) => {
  // Route tenant-scoped calls through the active hospital slug.
  if (needsTenantPrefix(config.url)) {
    config.url = `/${getTenantSlug()}${config.url}`;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (isTokenUsable(token)) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else if (config.headers && config.headers.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

// --- Auto-refresh on 401 -----------------------------------------------------
// Shared in-flight refresh so concurrent 401s trigger only one refresh call.
let refreshPromise = null;

const clearSessionStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const performRefresh = async () => {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw new Error("No refresh token");
  // Use a bare axios call so this request bypasses the interceptors.
  // Token refresh is hospital-scoped in T4.
  const { data } = await axios.post(
    `${backendUrl}/api/${getTenantSlug()}/auth/token/refresh/`,
    { refresh }
  );
  if (data.access) localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  // Backend rotates refresh tokens, so store the new one when returned.
  if (data.refresh) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  return data.access;
};

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/token/refresh",
  "/auth/logout",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthEndpoint = AUTH_PATHS.some((p) => url.includes(p));

    // Only try to refresh on a 401 from a non-auth call we haven't retried yet.
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      // No refresh token => this was a public/anonymous call; don't refresh.
      if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
        return Promise.reject(error);
      }
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return api(original); // retry once with the new access token
      } catch (refreshErr) {
        // Refresh failed → log out cleanly and notify the app.
        clearSessionStorage();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
