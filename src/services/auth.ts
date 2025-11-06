import coreApi, { refreshClient } from "@/lib/coreApi";
import { decodeJWT, isTokenExpired } from "@/lib/jwtUtils";

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

// TTL policy now controlled by cookie expiry directly
export const REFRESH_TTL_MS = 24 * 60 * 60 * 1000; // kept for reference but not stored

export function saveTokens(params: { accessToken: string; refreshToken?: string }) {
  if (typeof window === "undefined") return;
  const { accessToken, refreshToken } = params;
  // token: expire 15 menit; refreshToken: expire 24 jam
  setCookieMaxAge("token", accessToken, 15 * 60);
  if (refreshToken) {
    setCookieMaxAge("refreshToken", refreshToken, 24 * 60 * 60);
  }
  // Cleanup legacy cookies
  deleteCookie("access_token");
  deleteCookie("refresh_token");
  deleteCookie("refresh_expires_at");
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  deleteCookie("token");
  deleteCookie("refreshToken");
  // Cleanup legacy cookies
  deleteCookie("access_token");
  deleteCookie("refresh_token");
  deleteCookie("refresh_expires_at");
  localStorage.removeItem("user_name");
  // Best-effort: also clear any same-site cookies that might be used by backend/front-end
  try {
    const cookieNames = [
      "access_token",
      "refresh_token",
      "token",
      "refreshToken",
      "Authorization",
    ];

    const deleteCookie = (name: string, opts?: { domain?: string; secure?: boolean }) => {
      const parts: string[] = [
        `${encodeURIComponent(name)}=`,
        "expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "path=/",
      ];
      if (opts?.domain) parts.push(`domain=${opts.domain}`);
      if (opts?.secure) parts.push("secure");
      parts.push("samesite=lax");
      document.cookie = parts.join("; ");
    };

    const host = window.location.hostname;
    const domainsToTry = [undefined, host];
    // If subdomain like app.example.com, also try .example.com
    const hostParts = host.split(".");
    if (hostParts.length > 2) {
      const topLevel = hostParts.slice(-2).join(".");
      domainsToTry.push(`.${topLevel}`);
    }

    for (const name of cookieNames) {
      for (const domain of domainsToTry) {
        // Try both with and without secure flag to maximize deletion chances
        deleteCookie(name, { domain, secure: false });
        deleteCookie(name, { domain, secure: true });
      }
    }
  } catch (_) {
    // ignore cookie clearing errors
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie("token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie("refreshToken");
}

export function isRefreshExpired(): boolean {
  // Dengan cookie expiry, jika cookie hilang maka dianggap expired
  try {
    if (typeof window === "undefined") return true;
    const token = getCookie("refreshToken");
    return !token;
  } catch (_) {
    return true;
  }
}

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type AuthSuccess = {
  success: true;
  token: string;
  user: {
    id: number;
    name: string;
    email?: string;
    role: string;
  };
};

export type AuthFailure = {
  success: false;
  message: string;
};

export function getCurrentUser(): AuthSuccess["user"] | null {
  try {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      return null;
    }

    const payload = decodeJWT(token);
    if (!payload) return null;

    return {
      id: payload.userId,
      name: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export type LogoutResult = {
  success: boolean;
  message?: string;
};

export async function logout(): Promise<LogoutResult> {
  try {
    // Call the logout endpoint
    await coreApi.post(API_ENDPOINTS.LOGOUT);
    
    // Clear local storage
    clearTokens();
    
    return {
      success: true
    };
  } catch (err: any) {
    console.error('Logout error:', err);
    
    // Still clear local storage even if the API call fails
    clearTokens();
    
    return {
      success: false,
      message: err?.response?.data?.message || "Logout failed"
    };
  }
}

// Blueprint login: panggilan API asli dikomentari, return success
// API endpoints
const API_ENDPOINTS = {
  LOGIN: '/auth/login',    // This will be appended to the base URL from .env.local
  PROFILE: '/user/profile',
  LOGOUT: '/auth/logout'   // Will be /api/v1/auth/logout
};

export async function loginBlueprint(
  payload: LoginPayload
): Promise<AuthSuccess | AuthFailure> {
  try {
    // Make API call to your login endpoint
    const response = await coreApi.post(API_ENDPOINTS.LOGIN, {
      identifier: payload.identifier,
      password: payload.password
    });

    const { success, message, data } = response.data;
    
    if (success) {
      // Get user info from the JWT token
      const decodedToken = decodeJWT(data.token);
      
      if (!decodedToken) {
        return {
          success: false,
          message: "Invalid token received"
        };
      }

      // Store the JWT tokens in cookies (token 15m, refreshToken 24h)
      saveTokens({ accessToken: data.token, refreshToken: data.refreshToken });
      
      // Check if the user has the developer role
      const userRole = decodedToken.role.toLowerCase();
      if (userRole !== 'developer') {
        return {
          success: false,
          message: "Access denied. This portal is only for developers."
        };
      }

      return { 
        success: true, 
        token: data.token,
        user: {
          id: decodedToken.userId,
          name: decodedToken.sub,
          role: decodedToken.role
        }
      };
    }
    
    return {
      success: false,
      message: message || "Login failed"
    };
  } catch (err: any) {
    // Handle API errors
    console.error('Login error:', err);
    const message = err?.response?.data?.message || "Login failed";
    return { 
      success: false, 
      message 
    };
  }
}

// New: initiate login that may require OTP
export type LoginInitResult = {
  success: boolean;
  requiresOtp: boolean;
  message?: string;
};

export async function initiateLogin(
  payload: LoginPayload
): Promise<LoginInitResult> {
  try {
    const response = await coreApi.post('/auth/login', {
      identifier: payload.identifier,
      password: payload.password,
    });

    const { success, message, data } = response.data || {};

    if (!success) {
      return { success: false, requiresOtp: false, message: message || 'Login failed' };
    }

    // If token exists, login completed (no OTP required)
    if (data?.token) {
      const decodedToken = decodeJWT(data.token);
      if (!decodedToken) {
        return { success: false, requiresOtp: false, message: 'Invalid token received' };
      }
      // Persist tokens in cookies
      saveTokens({ accessToken: data.token, refreshToken: data.refreshToken });
      const userRole = (decodedToken.role || '').toLowerCase();
      if (userRole !== 'developer') {
        return { success: false, requiresOtp: false, message: 'Access denied. This portal is only for developers.' };
      }
      return { success: true, requiresOtp: false };
    }

    // Otherwise assume OTP is required
    return { success: true, requiresOtp: true };
  } catch (err: any) {
    console.error('Initiate login error:', err);
    return { success: false, requiresOtp: false, message: err?.response?.data?.message || 'Login failed' };
  }
}

// New: verify OTP for login
export async function verifyOtpLogin(params: { identifier: string; otp: string }): Promise<AuthSuccess | AuthFailure> {
  try {
    const response = await coreApi.post('/auth/verify-otp', {
      identifier: params.identifier,
      otp: params.otp,
      purpose: 'login',
    });

    const { success, message, data } = response.data || {};
    if (!success) {
      return { success: false, message: message || 'OTP verification failed' };
    }

    if (!data?.token) {
      return { success: false, message: 'No token returned from OTP verification' };
    }

    const decodedToken = decodeJWT(data.token);
    if (!decodedToken) {
      return { success: false, message: 'Invalid token received' };
    }

    // Persist tokens in cookies
    saveTokens({ accessToken: data.token, refreshToken: data.refreshToken });

    const userRole = (decodedToken.role || '').toLowerCase();
    if (userRole !== 'developer') {
      return { success: false, message: 'Access denied. This portal is only for developers.' };
    }

    return {
      success: true,
      token: data.token,
      user: {
        id: decodedToken.userId,
        name: decodedToken.sub,
        role: decodedToken.role,
      },
    };
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return { success: false, message: err?.response?.data?.message || 'OTP verification failed' };
  }
}

// Perform token refresh explicitly (normally handled by interceptor)
export async function refreshAccessToken(): Promise<{ success: boolean; accessToken?: string; refreshToken?: string; message?: string }>{
  try {
    if (isRefreshExpired()) {
      return { success: false, message: "Refresh token expired" };
    }
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { success: false, message: "No refresh token" };
    }

    const resp = await refreshClient.post(
      '/auth/refresh',
      { refreshToken }
    );

    const respData = resp?.data ?? {};
    const token = respData?.data?.token ?? respData?.token;
    const newRefresh = respData?.data?.refreshToken ?? respData?.refreshToken;
    if (!token) {
      return { success: false, message: respData?.message || 'Failed to refresh token' };
    }

    // Save new tokens to cookies
    saveTokens({ accessToken: token, refreshToken: newRefresh });
    return { success: true, accessToken: token, refreshToken: newRefresh };
  } catch (err: any) {
    return { success: false, message: err?.response?.data?.message || 'Failed to refresh token' };
  }
}
