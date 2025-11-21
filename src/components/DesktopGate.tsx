"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const DESKTOP_MIN_WIDTH = 1024;

function isMobileUA(ua: string) {
  const mobileRegex = /(Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini)/i;
  const tabletRegex = /(iPad|Tablet|Nexus 7|Nexus 10|KFAPWI|Silk)/i;
  return mobileRegex.test(ua) || tabletRegex.test(ua);
}

export default function DesktopGate() {
  const router = useRouter();
  const pathname = usePathname();
  const lastAction = useRef<string>("");

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

    const evaluate = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : DESKTOP_MIN_WIDTH;
      const onUnsupported = pathname?.startsWith("/unsupported-device");
      const shouldBlockByWidth = width < DESKTOP_MIN_WIDTH;
      const shouldBlockByUA = isMobileUA(ua);

      if ((shouldBlockByWidth || shouldBlockByUA) && !onUnsupported) {
        if (lastAction.current !== "to-unsupported") {
          lastAction.current = "to-unsupported";
          router.replace("/unsupported-device");
        }
      } else if (!shouldBlockByWidth && !shouldBlockByUA && onUnsupported) {
        if (lastAction.current !== "to-login") {
          lastAction.current = "to-login";
          router.replace("/login");
        }
      }
    };

    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, [router, pathname]);

  return null;
}

