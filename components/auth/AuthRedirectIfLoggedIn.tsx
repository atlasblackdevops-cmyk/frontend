'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/use-auth-store';

export function AuthRedirectIfLoggedIn({ to = '/dashboard' }: { to?: string }) {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace(to);
    }
  }, [token, to, router]);

  return null;
}
