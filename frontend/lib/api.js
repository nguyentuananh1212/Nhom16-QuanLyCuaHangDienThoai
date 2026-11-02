// Mọi lời gọi API đi qua đây: gắn token, chuẩn hoá lỗi.
// Đường dẫn tương đối "/api/..." -> Next rewrites chuyển sang Spring Boot (xem next.config.mjs).
const TOKEN_KEY = "ps_token";
const USER_KEY = "ps_user";

const notify = () => window.dispatchEvent(new Event("auth-change"));

export const storage = {
  getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  /** Chuỗi JSON thô của user (so sánh được bằng ===, dùng làm snapshot cho useSyncExternalStore) */
  getUserRaw() {
    try { return localStorage.getItem(TOKEN_KEY) ? localStorage.getItem(USER_KEY) || "null" : "null"; } catch { return "null"; }
  },
  save(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    notify();
  },
  clear() { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {} notify(); },
  /** auth-change: thay đổi trong tab này; storage: thay đổi từ tab khác */
  subscribe(cb) {
    window.addEventListener("auth-change", cb);
    window.addEventListener("storage", cb);
    return () => { window.removeEventListener("auth-change", cb); window.removeEventListener("storage", cb); };
  },
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Có lỗi xảy ra");
    this.status = status;
    this.code = body?.code;
    this.fields = body?.fields || {};
  }
}

export async function api(path, { method = "GET", body, query } = {}) {
  let url = path;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, v);
    });
    const s = qs.toString();
    if (s) url += "?" + s;
  }
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = storage.getToken();
  if (token) headers.Authorization = "Bearer " + token;

  let res;
  try {
    res = await fetch(url, {
      method, headers, cache: "no-store",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { message: "Không kết nối được máy chủ" });
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) {
      storage.clear();
      window.dispatchEvent(new Event("auth-expired"));
    }
    // Backend tắt hoặc sai BACKEND_URL -> Next trả 500/502 không phải JSON của API
    if (!data && res.status >= 500) throw new ApiError(res.status, { message: "Không kết nối được máy chủ API" });
    throw new ApiError(res.status, data);
  }
  return data;
}

/** Chỉ chấp nhận đường dẫn nội bộ -> chống open redirect qua ?next=https://trang-la.com */
export function safeNext(next, fallback = "/") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
