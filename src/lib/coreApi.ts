import axios, { AxiosHeaders } from "axios";

// Axios instance untuk seluruh request ke API Satu Atap
const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: sisipkan Authorization jika ada token di localStorage
coreApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
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
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token endpoint
        const response = await coreApi.post("/auth/refresh", {
          refreshToken,
        });

        if (response.data.success) {
          const { token } = response.data.data;
          localStorage.setItem("access_token", token);

          // Update authorization header
          originalRequest.headers["Authorization"] = `Bearer ${token}`;

          // Process queued requests
          processQueue(null, token);

          // Retry the original request
          return coreApi(originalRequest);
        } else {
          processQueue(new Error("Failed to refresh token"));
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If error is still 401 after refresh attempt, or any other error
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
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
