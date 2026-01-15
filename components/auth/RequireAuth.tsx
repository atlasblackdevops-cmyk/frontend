'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/stores/use-auth-store';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { status } = useSession();
  const { token, isSubscribed } = useAuth();
  const pathname = usePathname();

  // Middleware handles the redirects. This component now primarily ensures 
  // that we don't render protected content before the session is ready.
  
  if (status === 'loading') return null;
  
  const isLoggedIn = status === 'authenticated' || !!token;

  // If not logged in, hide content (The middleware handles the redirect)
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
