'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button, ButtonProps } from '@mantine/core';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/use-auth-store';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string;
}

export function LogoutButton({ label = 'Logout', ...props }: LogoutButtonProps) {
  const router = useRouter();
  const { token, setToken } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      const storedAccessToken =
        token ||
        (typeof window !== 'undefined' &&
          (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'))) ||
        null;

      // First, clear NextAuth session cookie to avoid re-auth race
      await signOut({ redirect: false });

      // Best-effort backend logout (use captured token)
      if (storedAccessToken) {
        void api
          .post('/api/v1/auth/logout', undefined, {
            headers: {
              Authorization: `Bearer ${storedAccessToken}`,
            },
          })
          .catch(() => {
            // ignore
          });
      }

      // Now clear tokens from storage and state
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        }
      } catch {
        // no-op
      }
      setToken(null);

      // Finally navigate to login
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button loading={loading} onClick={handleLogout} {...props}>
      {label}
    </Button>
  );
}
