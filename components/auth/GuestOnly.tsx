"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/stores/use-auth-store";

interface GuestOnlyProps {
  children: React.ReactNode;
  to?: string;
}

export function GuestOnly({ children, to = "/dashboard" }: GuestOnlyProps) {
  const { status } = useSession();
  const { token } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLoggedIn = status === "authenticated" || !!token;

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (hydrated && isLoggedIn) {
      router.replace(to);
    }
  }, [hydrated, isLoggedIn, router, to]);

  // Middleware handles the redirects. This component primarily ensures
  // that we don't flash guest content if the user is already logged in.

  if (!hydrated) return null;
  if (isLoggedIn) return null;

  return <>{children}</>;
}
