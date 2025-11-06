import axios, { AxiosHeaders } from "axios";

// Axios instance untuk seluruh request ke API Satu Atap
const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080/api/v1",
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080/api/v1",
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance khusus untuk refresh token agar tidak terkena loop interceptor
export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080/api/v1",
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance untuk Credit Score API (Java service)
const creditScoreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CREDIT_SCORE_API_URL || "http://localhost:9009/api/v1",
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
      const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers as any);
      const token = getCookie("token");
      if (token) {
        const authHeader = `Bearer ${token}`;
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", authHeader);
        } else {
          config.headers = new AxiosHeaders(config.headers as any);
          config.headers.set("Authorization", authHeader);
        }
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
      const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers as any);
      const token = getCookie("token");
      if (token) {
        const authHeader = `Bearer ${token}`;
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", authHeader);
        } else {
          config.headers = new AxiosHeaders(config.headers as any);
          config.headers.set("Authorization", authHeader);
        }
      }
    }
  } catch (_) {}
  return config;
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
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
  try {
    const response = await coreApi.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
    const response = await creditScoreApi.post(`/credit-score`, {
      user_id: userId
    });
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

    const response = await creditScoreApi.post(`/recommendation-system`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Error fetching credit recommendation:", error);
    throw error;
  }
};
