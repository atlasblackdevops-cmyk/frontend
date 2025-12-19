'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/use-auth-store';

export function AuthRedirectIfLoggedIn({ to = '/dashboard' }: { to?: string }) {
  const router = useRouter();
  const { token,isSubscribed } = useAuth();

  useEffect(() => {
    if (token) {
      if(!isSubscribed ) {
        console.log("asda======")
        router.replace('/subscription');
      } else {
        router.replace(to);
      }
    }
  }, [token, to, router, isSubscribed]);

  return null;
}
