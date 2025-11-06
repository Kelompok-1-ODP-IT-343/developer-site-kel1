// api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

/** ---------------- Helpers & Types ---------------- */

type AuthAxiosRequestConfig = InternalAxiosRequestConfig & {
  /** Tandai request yang harus melewati mekanisme auth (mis. /auth/refresh) */
  skipAuth?: boolean;
  /** Penanda internal agar interceptor tidak infinite retry */
  _retry?: boolean;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any | null, token?: string) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("refresh_token", token);
}

function getRefreshExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("refresh_expires_at");
  return v ? Number(v) : null;
}

function setRefreshExpiresAt(ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem("refresh_expires_at", String(ts));
}

function clearTokensAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh_expires_at");
  window.location.assign("/login");
}

/** Set Authorization header pada config (kompatibel dgn AxiosHeaders atau object) */
function setAuthHeaderOnConfig(
  config: AuthAxiosRequestConfig,
  token: string
): void {
  const hdrs: any = config.headers ?? {};
  if (typeof hdrs.set === "function") {
    hdrs.set("Authorization", `Bearer ${token}`);
    config.headers = hdrs;
  } else {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
}

/** ---------------- Axios Instances ---------------- */

// API utama (Satu Atap)
const coreApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// API Credit Score (Java service)
const creditScoreApi: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_CREDIT_SCORE_API_URL ||
    "http://localhost:9009/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** ---------------- Request Interceptor ---------------- */

coreApi.interceptors.request.use(
  (config: AuthAxiosRequestConfig) => {
    try {
      // Hormati skipAuth: jangan sisipkan Authorization untuk request tertentu
      if (config.skipAuth) return config;

      const token = getAccessToken();
      if (token) setAuthHeaderOnConfig(config, token);
    } catch {
      // abaikan error akses localStorage saat SSR
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** ---------------- Response Interceptor (401 & refresh) ---------------- */

coreApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as AuthAxiosRequestConfig;

    // Jangan tangani auth utk request yang bertanda skipAuth (mis. /auth/refresh)
    if (originalRequest?.skipAuth) {
      return Promise.reject(error);
    }

    // Network error tanpa response: jangan paksa logout
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      // Jika request ini sudah dicoba retry setelah refresh -> hard fail & logout
      if (originalRequest._retry) {
        clearTokensAndRedirect();
        return Promise.reject(error);
      }

      // Jika sudah ada proses refresh di-progres, antrekan request dan tunggu token baru
      if (isRefreshing) {
        try {
          const newToken = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest._retry = true;
          setAuthHeaderOnConfig(originalRequest, newToken);
          return coreApi(originalRequest);
        } catch (e) {
          return Promise.reject(e);
        }
      }

      // Mulai proses refresh token
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const exp = getRefreshExpiresAt();
        if (exp && Date.now() > exp) throw new Error("Refresh token expired");

        // panggil endpoint refresh dengan skipAuth agar bebas dari auth interceptor
        const res = await coreApi.post(
          "/auth/refresh",
          { refreshToken },
          { skipAuth: true } as AuthAxiosRequestConfig
        );

        const success = (res as any)?.data?.success;
        const token: string | undefined = (res as any)?.data?.data?.token;

        if (!success || !token) {
          throw new Error("Failed to refresh token");
        }

        // Simpan token baru
        setAccessToken(token);

        const newRefresh = (res as any)?.data?.data?.refreshToken as
          | string
          | undefined;
        if (newRefresh) {
          setRefreshToken(newRefresh);
          // perpanjang 24 jam (opsional, sesuaikan dgn backend)
          setRefreshExpiresAt(Date.now() + 24 * 60 * 60 * 1000);
        }

        // Penting: update default Authorization agar request yang dibuat setelah ini langsung pakai token baru
        coreApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Lepaskan antrean request yang menunggu hasil refresh
        processQueue(null, token);

        // Ulang request asli dengan token baru
        setAuthHeaderOnConfig(originalRequest, token);
        return coreApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, undefined);
        clearTokensAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Bukan 401 -> teruskan error
    return Promise.reject(error);
  }
);

/** ---------------- Exports (instances) ---------------- */
export default coreApi;
export { creditScoreApi };

/** ---------------- API Wrappers ---------------- */

// User Profile
export const getUserProfile = async () => {
  const res = await coreApi.get("/user/profile");
  return res.data;
};

// KPR Applications progress (Developer)
export const getKPRApplicationsProgress = async () => {
  const res = await coreApi.get("/kpr-applications/developer/progress");
  return res.data;
};

// KPR Application detail
export const getKPRApplicationDetail = async (applicationId: string) => {
  const res = await coreApi.get(`/kpr-applications/${applicationId}`);
  return res.data;
};

// Approve KPR (Developer)
export const approveKPRApplication = async (
  applicationId: string,
  approvalNotes: string
) => {
  const res = await coreApi.post(`/approval/developer`, {
    isApproved: true,
    reason: approvalNotes || "",
    applicationId: parseInt(applicationId, 10),
  });
  return res.data;
};

// Reject KPR (Developer)
export const rejectKPRApplication = async (
  applicationId: string,
  rejectionReason: string
) => {
  const res = await coreApi.post(`/approval/developer`, {
    isApproved: false,
    reason: rejectionReason || "",
    applicationId: parseInt(applicationId, 10),
  });
  return res.data;
};

// Credit Score
export const getCreditScore = async (userId: string) => {
  const res = await creditScoreApi.post(`/credit-score`, { user_id: userId });
  return res.data;
};

// Credit Recommendation
// - Ambil detail aplikasi dari coreApi
// - Kirim ke service rekomendasi di creditScoreApi
export const getCreditRecommendation = async (applicationId: string) => {
  const appDetail = await getKPRApplicationDetail(applicationId);
  const payload = (appDetail as any)?.data ?? appDetail;

  const requestBody = {
    kprApplication: {
      success: true,
      message: "KPR application detail retrieved successfully",
      data: payload,
    },
  };

  const res = await creditScoreApi.post(`/recommendation-system`, requestBody);
  return res.data;
};
