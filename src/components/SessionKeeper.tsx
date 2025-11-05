"use client";

import { useEffect, useRef } from "react";
import { refreshAccessToken, isRefreshExpired, getAccessToken } from "@/services/auth";
import { isTokenExpired, decodeJWT } from "@/lib/jwtUtils";

// Keep the user's session alive by refreshing the access token automatically.
// Strategy:
// - On mount, if access token is expired but refresh token is still valid, refresh immediately.
// - Then, check periodically; if token will expire within the next minute, refresh proactively.
// - If refresh token is expired, do nothing here — API calls will redirect to /login via interceptor.
export default function SessionKeeper() {
  const isRefreshingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let canceled = false;

    const attemptRefresh = async () => {
      if (canceled || isRefreshingRef.current) return;
      if (isRefreshExpired()) return; // can't refresh anymore
      isRefreshingRef.current = true;
      try {
        await refreshAccessToken();
      } finally {
        isRefreshingRef.current = false;
      }
    };

    const shouldRefreshSoon = (token: string) => {
      try {
        const payload = decodeJWT(token);
        if (!payload?.exp) return false;
        const nowSec = Math.floor(Date.now() / 1000);
        // Refresh if expiry is within 60 seconds
        return payload.exp - nowSec <= 60;
      } catch {
        return false;
      }
    };

    const tick = async () => {
      if (typeof window === "undefined") return;
      const access = getAccessToken();
      if (!access) return; // not logged in
      if (isTokenExpired(access) || shouldRefreshSoon(access)) {
        await attemptRefresh();
      }
    };

    // Initial check on mount
    tick();

    // Set up periodic checks every 2 minutes
    intervalRef.current = window.setInterval(tick, 2 * 60 * 1000);

    // Also refresh when tab becomes visible if close to expiry
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      canceled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
