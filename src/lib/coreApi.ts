import axios, { AxiosHeaders } from "axios";

// Axios instance untuk seluruh request ke API Satu Atap
const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080/api/v1",
  timeout: 10000,
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

// Interceptor: sisipkan Authorization jika ada token di localStorage
coreApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      // Allow opting-out from Authorization header
      const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers as any);
      const skipAuth = headers.get("x-skip-auth") === "true";
      if (skipAuth) {
        config.headers = headers;
        return config;
      }
      const token = localStorage.getItem("access_token");
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
    // abaikan jika localStorage tidak tersedia
  }
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

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return coreApi(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get the refresh token from storage
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Optional client-side 24h policy: stop if refresh appears expired
        if (typeof window !== "undefined") {
          const expStr = localStorage.getItem("refresh_expires_at");
          if (expStr && Date.now() > Number(expStr)) {
            throw new Error("Refresh token expired");
          }
        }

        // Call refresh token endpoint
        const response = await coreApi.post(
          "/auth/refresh",
          { refreshToken },
          { headers: { "x-skip-auth": "true" } }
        );

        if (response.data.success) {
          const { token } = response.data.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", token);
            // If API also returns new refresh token, persist it and bump expiry window to 24h
            if (response.data?.data?.refreshToken) {
              localStorage.setItem("refresh_token", response.data.data.refreshToken);
              localStorage.setItem("refresh_expires_at", String(Date.now() + 24 * 60 * 60 * 1000));
            }
          }

          // Update authorization header
          originalRequest.headers["Authorization"] = `Bearer ${token}`;

          // Process queued requests
          processQueue(null, token);

          // Retry the original request
          return coreApi(originalRequest);
        } else {
          processQueue(new Error("Failed to refresh token"));
          // Clear tokens and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("refresh_expires_at");
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        // Clear tokens and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("refresh_expires_at");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If error is still 401 after refresh attempt, or any other error
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("refresh_expires_at");
        window.location.href = "/login";
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
