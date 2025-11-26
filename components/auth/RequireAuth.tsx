'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/stores/use-auth-store';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const router = useRouter();
  const { status } = useSession();
  const { token } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' && !token) {
      router.replace(redirectTo);
    }
  }, [status, token, router, redirectTo]);

  // Hide content while checking/redirecting
  if (status === 'loading') return null;
  if (status === 'unauthenticated' && !token) return null;
  return <>{children}</>;
}
