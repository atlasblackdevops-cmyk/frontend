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
  const router = useRouter();
  const { status } = useSession();
  const { token, role, hasFarm,isSubscribed } = useAuth();
  const roleKnown = role != null || hasFarm != null;
  const needsFarm: boolean | null = roleKnown
    ? String(role ?? "").toUpperCase() === "OWNER" && hasFarm === false
    : null;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLoggedIn = status === "authenticated" || !!token;

  useEffect(() => {
    if (!hydrated) return;
   console.log(isSubscribed ,'isSubscribed ')
    if (isLoggedIn) {
        // Always redirect to dashboard; FarmGate will handle modal if needed
        router.replace(to);
      }
    
  }, [hydrated, isLoggedIn, router, to]);

  // Hide content until we know whether to redirect
  if (!hydrated) return null;
  if (isLoggedIn) return null;
  return <>{children}</>;
}
