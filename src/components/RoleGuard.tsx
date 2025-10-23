'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from '@/services/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    
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
  }, [allowedRoles, router]);

  return <>{children}</>;
}