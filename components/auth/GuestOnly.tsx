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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLoggedIn = status === "authenticated" || !!token;

  // Middleware handles the redirects. This component primarily ensures
  // that we don't flash guest content if the user is already logged in.

  if (!hydrated) return null;
  if (isLoggedIn) return null;

  return <>{children}</>;
}
