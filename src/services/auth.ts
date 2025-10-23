import coreApi from "@/lib/coreApi";
import { decodeJWT, isTokenExpired } from "@/lib/jwtUtils";

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
    const token = localStorage.getItem("access_token");
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_name");
    }
    
    return {
      success: true
    };
  } catch (err: any) {
    console.error('Logout error:', err);
    
    // Still clear local storage even if the API call fails
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_name");
    }
    
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

      // Store the JWT token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("refresh_token", data.refreshToken);
      }
      
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
