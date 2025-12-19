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
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { token, isSubscribed } = useAuth();

  // Redirect to subscription page if user is not subscribed and is authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    // Only redirect if user is authenticated (has token) and not subscribed
    // Also check that we're not already on a subscription-related page to avoid infinite redirects
    const isOnSubscriptionPage = pathname?.startsWith('/subscription');
    if (token && !isSubscribed && !isOnSubscriptionPage) {
      router.replace('/subscription');
    }
  }, [status, token, isSubscribed, pathname, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' && !token) {
      router.replace(redirectTo);
    }
  }, [status, token, router, redirectTo]);

  // Hide content while checking/redirecting
  if (status === 'loading') return null;
  if (status === 'unauthenticated' && !token) return null;
  // Don't render children if redirecting to subscription
  const isOnSubscriptionPage = pathname?.startsWith('/subscription');
  if (token && !isSubscribed && !isOnSubscriptionPage) return null;
  return <>{children}</>;
}
