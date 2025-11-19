import axios, { AxiosHeaders } from "axios";
import { decodeJWT } from "@/lib/jwtUtils";

// Resolve base URLs robustly across browser/SSR and support proxy targets when using relative base URLs
const isBrowser = typeof window !== "undefined";
// New single base URL (preferred): e.g. http://localhost:18080
const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
// Legacy envs (still supported as fallback)
const envCore = process.env.NEXT_PUBLIC_API_URL;
const envCredit = process.env.NEXT_PUBLIC_CREDIT_SCORE_API_URL;

function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function resolveBaseUrl(envUrl: string | undefined, fallbackRelative: string, fallbackProxyEnv: string | undefined, fallbackAbsolute: string) {
  if (envUrl && envUrl.length > 0) {
    if (isBrowser) return envUrl; // browser can use relative or absolute
    // SSR: if env is relative (starts with '/'), use proxy target; else use as-is
    if (envUrl.startsWith("/")) return fallbackProxyEnv || fallbackAbsolute;
    return envUrl;
  }
  // No env provided
  if (isBrowser) return fallbackRelative;
  return fallbackProxyEnv || fallbackAbsolute;
}

// Prefer NEXT_PUBLIC_API_BASE_URL if provided; else fall back to legacy behavior
const coreBaseURL = envBase && envBase.length > 0
  ? joinUrl(envBase, "/api/v1")
  : resolveBaseUrl(
      envCore,
      "/api/v1",
      process.env.API_PROXY_TARGET_CORE,
      "https://satuatap.my.id/api/v1"
    );

// Axios instance untuk seluruh request ke API Satu Atap
const coreApi = axios.create({
  baseURL: coreBaseURL,
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance khusus untuk refresh token agar tidak terkena loop interceptor
export const refreshClient = axios.create({
  baseURL: coreBaseURL,
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Kredit / Recommendation API
// Prioritas penentuan base URL:
// 1. Jika NEXT_PUBLIC_CREDIT_SCORE_API_URL di-set (absolute atau relative) -> gunakan itu
// 2. Jika tidak ada dan core + credit digabung (envBase) -> gunakan coreBaseURL
// 3. Jika tidak ada envBase (mode legacy relative) -> gunakan mekanisme resolveBaseUrl dengan fallback proxy
const unifiedCredit = Boolean(envBase); // true bila menggunakan NEXT_PUBLIC_API_BASE_URL untuk core
const creditBaseURL = (envCredit && envCredit.length > 0)
  ? envCredit // dukung absolute: http://localhost:9009/api/v1
  : (unifiedCredit
      ? coreBaseURL
      : resolveBaseUrl(
          envCredit,
          "/credit-api",
          process.env.API_PROXY_TARGET_CREDIT,
          "https://ai.satuatap.my.id/api/v2"
        )
    );

const creditScoreApi = axios.create({
  baseURL: creditBaseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!value) return null;
  try {
    return decodeURIComponent(value.split("=")[1]);
  } catch {
    return value.split("=")[1];
  }
}

function setCookieMaxAge(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; max-age=${maxAgeSeconds}; path=/; ${isHttps ? "secure; " : ""}SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=; max-age=0; path=/; ${isHttps ? "secure; " : ""}SameSite=Lax`;
}

// Cleanup legacy cookies that are no longer used
try {
  if (typeof window !== "undefined") {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("refresh_expires_at");
  }
} catch {}

// Interceptor: sisipkan Authorization jika ada token di cookie
coreApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = getCookie("token");
      if (token) {
        const authHeader = `Bearer ${token}`;
        const h = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers as any);
        h.set("Authorization", authHeader);
        config.headers = h;
      }
    }
  } catch (_) {
    // abaikan jika cookie tidak tersedia
  }
  return config;
});

// Ensure Credit Score API also attaches Authorization from cookie
creditScoreApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = getCookie("token");
      if (token) {
        const authHeader = `Bearer ${token}`;
        const h = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers as any);
        h.set("Authorization", authHeader);
        config.headers = h;
      }
    }
  } catch (_) {}
  return config;
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: { resolve: (value: string | null) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor response: handle 401 errors and token refresh
coreApi.interceptors.response.use(
  (response) => response,
  async (error) => {
  const originalRequest = error.config;

    // If error is 401/403 and we haven't tried to refresh the token yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers instanceof AxiosHeaders) {
            (originalRequest.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return coreApi(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get the refresh token from cookie
        const refreshToken = typeof window !== "undefined" ? getCookie("refreshToken") : null;
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token endpoint via dedicated client
        const response = await refreshClient.post(
          "/auth/refresh",
          { refreshToken }
        );

        const respData = response?.data ?? {};
        const token = respData?.data?.token ?? respData?.token;
        const newRefresh = respData?.data?.refreshToken ?? respData?.refreshToken;
        const isOk = Boolean(token);
        if (isOk) {
          if (typeof window !== "undefined") {
            // Update cookies: token 15 menit, refreshToken 24 jam
            setCookieMaxAge("token", token, 15 * 60);
            if (newRefresh) {
              setCookieMaxAge("refreshToken", newRefresh, 24 * 60 * 60);
            }
          }

          // Update authorization header
          if (originalRequest.headers instanceof AxiosHeaders) {
            (originalRequest.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }

          // Process queued requests
          processQueue(null, token);

          // Retry the original request
          return coreApi(originalRequest);
        } else {
          processQueue(new Error("Failed to refresh token"));
          // Clear tokens and redirect to login
          if (typeof window !== "undefined") {
            deleteCookie("token");
            deleteCookie("refreshToken");
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        // Clear tokens and redirect to login
        if (typeof window !== "undefined") {
          deleteCookie("token");
          deleteCookie("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // No fallback logout for 401/403 here; only refresh failure triggers logout.

    return Promise.reject(error);
  }
);

// Apply same refresh logic for creditScoreApi so requests retry after refresh
creditScoreApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers instanceof AxiosHeaders) {
            (originalRequest.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return creditScoreApi(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = typeof window !== "undefined" ? getCookie("refreshToken") : null;
        if (!refreshToken) throw new Error("No refresh token available");
        const response = await refreshClient.post("/auth/refresh", { refreshToken });
        const respData = response?.data ?? {};
        const token = respData?.data?.token ?? respData?.token;
        const newRefresh = respData?.data?.refreshToken ?? respData?.refreshToken;
        const isOk = Boolean(token);
        if (isOk) {
          if (typeof window !== "undefined") {
            setCookieMaxAge("token", token, 15 * 60);
            if (newRefresh) setCookieMaxAge("refreshToken", newRefresh, 24 * 60 * 60);
          }
          if (originalRequest.headers instanceof AxiosHeaders) {
            (originalRequest.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          processQueue(null, token);
          return creditScoreApi(originalRequest);
        } else {
          processQueue(new Error("Failed to refresh token"));
          if (typeof window !== "undefined") {
            deleteCookie("token");
            deleteCookie("refreshToken");
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          deleteCookie("token");
          deleteCookie("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default coreApi;

// User Profile API functions
export const getUserProfile = async () => {
  // Helper to normalize different backend response shapes to { success: true, data }
  const normalize = (raw: any) => {
    // If backend returns wrapper { success, data }
    if (raw && typeof raw === "object" && ("data" in raw || "success" in raw)) {
      const success = (raw.success === undefined) ? true : Boolean(raw.success);
      const data = raw.data !== undefined ? raw.data : raw;
      if (!success) {
        const msg = raw?.message || "Failed to fetch profile";
        throw new Error(msg);
      }
      return { success: true, data };
    }
    // If backend returns plain user object
    return { success: true, data: raw };
  };

  // Try a list of possible endpoints in order
  const tryPaths: string[] = [
    "/user/profile",
    "/users/profile",
  ];

  // First attempt: profile endpoints
  for (const path of tryPaths) {
    try {
      const resp = await coreApi.get(path);
      return normalize(resp?.data);
    } catch (_e) {
      // try next
    }
  }

  // Second attempt: by userId from JWT
  try {
    const token = typeof document !== "undefined" ? getCookie("token") : null;
    if (!token) throw new Error("No access token");
    const payload = decodeJWT(token as string);
    const userId = (payload as any)?.userId;
    if (!userId) throw new Error("No userId in token");

    const pathsById = [
      `/user/${userId}`,
      `/users/${userId}`,
    ];
    for (const path of pathsById) {
      try {
        const resp = await coreApi.get(path);
        return normalize(resp?.data);
      } catch (_) {
        // try next id path
      }
    }

    throw new Error("All profile endpoints failed");
  } catch (finalErr) {
    console.error("Error fetching user profile:", finalErr);
    throw finalErr;
  }
};

// Update user profile by ID. Always include status: "ACTIVE" unless explicitly provided.
export const updateUserProfile = async (
  userId: number,
  data: Record<string, any>
) => {
  try {
    const body = { status: "ACTIVE", ...data };
    // Try primary path first
    try {
      const response = await coreApi.put(`/user/${userId}`, body);
      return response.data;
    } catch (_) {
      // Fallback alternate path
      const response = await coreApi.put(`/users/${userId}`, body);
      return response.data;
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// KPR Applications API functions
export const getKPRApplicationsProgress = async () => {
  try {
    const response = await coreApi.get("/kpr-applications/developer/progress");
    return response.data;
  } catch (error) {
    console.error("Error fetching KPR applications progress:", error);
    throw error;
  }
};

export const getKPRApplicationDetail = async (applicationId: string) => {
  try {
    const response = await coreApi.get(`/kpr-applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching KPR application detail:", error);
    throw error;
  }
};

export const approveKPRApplication = async (applicationId: string, approvalNotes: string) => {
  try {
    const response = await coreApi.post(`/approval/developer`, {
      isApproved: true,
      reason: approvalNotes || "",
      applicationId: parseInt(applicationId)
    });
    return response.data;
  } catch (error) {
    console.error("Error approving KPR application:", error);
    throw error;
  }
};

export const rejectKPRApplication = async (applicationId: string, rejectionReason: string) => {
  try {
    const response = await coreApi.post(`/approval/developer`, {
      isApproved: false,
      reason: rejectionReason || "",
      applicationId: parseInt(applicationId)
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting KPR application:", error);
    throw error;
  }
};

export const getCreditScore = async (userId: string) => {
  try {
    // Jika unifiedCredit: endpoint langsung '/credit-score'; jika legacy: prefix '/credit-score' tetap ditambahkan di creditScoreApi base (/credit-api)
    const path = `/credit-score`;
    const response = await creditScoreApi.post(path, { user_id: userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching credit score:", error);
    throw error;
  }
};

// Credit Recommendation API
// Convenience wrapper: provide applicationId, this will fetch the application detail
// from coreApi and post to the recommendation-system endpoint on the credit score API.
export const getCreditRecommendation = async (applicationId: string) => {
  try {
    // Fetch application detail first (reusing existing helper which returns response.data)
    const appDetail = await getKPRApplicationDetail(applicationId);

    // Some endpoints return { success, message, data }, some may return plain
    const payload = (appDetail as any)?.data ?? appDetail;

    const requestBody = {
      kprApplication: {
        success: true,
        message: "KPR application detail retrieved successfully",
        data: payload,
      },
    };

    const path = `/recommendation-system`;
    const response = await creditScoreApi.post(path, requestBody);
    return response.data;
  } catch (error) {
    console.error("Error fetching credit recommendation:", error);
    throw error;
  }
};

// Developer Dashboard Stats
// Fetches statistics for the developer dashboard.
// Example endpoint: GET /stat-developer/dashboard?range=7m
// Ensures all numeric fields default to 0 when null/undefined.
export const getDeveloperDashboardStats = async (range?: string) => {
  try {
    const response = await coreApi.get(`/stat-developer/dashboard`, {
      params: range ? { range } : undefined,
    });

    // Support both wrapped and direct payloads
    const raw = (response.data && (response.data.data ?? response.data)) || {};

    const toNum = (v: any) => (typeof v === "number" && isFinite(v) ? v : 0);
    const toStr = (v: any) => (typeof v === "string" ? v : "");
    const arr = (v: any) => (Array.isArray(v) ? v : []);

    const kpiRaw = raw.kpi || {};

    const normalized = {
      timestamp: toStr(raw.timestamp) || new Date().toISOString(),
      kpi: {
        approved: {
          value: toNum(kpiRaw?.approved?.value),
          percentage_change: toNum(kpiRaw?.approved?.percentage_change),
        },
        rejected: {
          value: toNum(kpiRaw?.rejected?.value),
          percentage_change: toNum(kpiRaw?.rejected?.percentage_change),
        },
        pending: {
          value: toNum(kpiRaw?.pending?.value),
          percentage_change: toNum(kpiRaw?.pending?.percentage_change),
        },
        customers: {
          value: toNum(kpiRaw?.customers?.value),
          percentage_change: toNum(kpiRaw?.customers?.percentage_change),
        },
      },
      growthAndDemand: arr(raw.growthAndDemand).map((d: any) => ({
        month: toStr(d?.month),
        total_requests: toNum(d?.total_requests),
        total_approved: toNum(d?.total_approved),
      })),
      outstandingLoan: arr(raw.outstandingLoan).map((d: any) => ({
        month: toStr(d?.month),
        amount_miliar: toNum(d?.amount_miliar),
      })),
      processingFunnel: arr(raw.processingFunnel).map((d: any) => ({
        stage: toStr(d?.stage),
        count: toNum(d?.count),
      })),
      userRegistered: arr(raw.userRegistered).map((d: any) => ({
        month: toStr(d?.month),
        count: toNum(d?.count),
      })),
    };

    return normalized;
  } catch (error) {
    console.error("Error fetching developer dashboard stats:", error);
    throw error;
  }
};

// Notifications - current user
export type ApiNotification = {
  id: number;
  userId: number;
  notificationType: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  metadata?: any;
  createdAt: string;
};

export const getUserNotifications = async (): Promise<ApiNotification[]> => {
  try {
    const response = await coreApi.get(`/notifications/user`);
    const payload = response?.data?.data ?? response?.data ?? [];
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};
