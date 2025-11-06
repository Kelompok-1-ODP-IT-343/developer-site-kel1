'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser, getRefreshToken } from '@/services/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function guard() {
      // First, try current token
      let user = getCurrentUser();

      // If no user and refresh token exists, wait briefly for interceptor-driven refresh
      if (!user) {
        const rt = getRefreshToken();
        if (rt) {
          // Poll for up to ~1.5s waiting for token to be refreshed by interceptors
          for (let i = 0; i < 150 && !user && !cancelled; i++) {
            await new Promise((r) => setTimeout(r, 100));
            user = getCurrentUser();
          }
        }
      }

      if (!user) {
        router.push('/login');
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate page based on role
        switch (user.role) {
          case 'DEVELOPER':
            router.push('/dashboard/inputbydev');
            break;
          case 'ADMIN':
            router.push('/dashboard');
            break;
          default:
            router.push('/login');
        }
      }
    }

    void guard();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, router]);

  return <>{children}</>;
}