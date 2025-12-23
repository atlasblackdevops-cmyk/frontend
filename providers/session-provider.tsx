"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useAuth } from "../stores/use-auth-store";

interface Props {
  children: ReactNode;
  session?: Session | null;
}

function AuthSessionProvider({ children, session }: Props) {
    function SessionSync() {
    const {
      setToken,
      setRefreshToken,
      setUserId,
      setRoleAndFarm,
      setUserData,
      setIsSubscribed,
    } = useAuth();
    const { data: nextAuthSession, status } = useSession();

    useEffect(() => {
      if (status === "authenticated" && nextAuthSession) {
        const accessToken = (nextAuthSession as any).accessToken;
        const isSubscribed = (nextAuthSession as any).isSubscribed === true;
        const uid = (nextAuthSession.user as any)?.id;

        // CHECK IF USER MANUALLY CLEARED STORAGE
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("accessToken");
          const isLoggingIn = sessionStorage.getItem("is_logging_in") === "true";

          if (!storedToken && !isLoggingIn) {
            console.log("[SessionSync] LocalStorage is empty. Triggering signOut to match manual clearing.");
            void signOut({ callbackUrl: "/login" });
            return;
          }
        }

        if (accessToken) {
          setToken(accessToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            // Once we have synched, clear the "is_logging_in" flag
            sessionStorage.removeItem("is_logging_in");
          }
        }

        setIsSubscribed(isSubscribed);
        setUserId(uid ?? null);

        // Fetch user metadata if role/farm info is missing
        const currentAuthState = useAuth.getState();
        if (accessToken && (currentAuthState.role === null || currentAuthState.hasFarm === null)) {
          (async () => {
            try {
              const res = await api.get("/api/v1/auth/me");
              const payload = res.data?.data ?? res.data;

              // Normalize role name
              const rawRole = payload?.role ?? payload?.user?.role ?? payload?.data?.role ?? null;
              const roleName = (typeof rawRole === "string" && rawRole) || rawRole?.roleName || rawRole?.name || null;

              // Derive hasFarm
              let hasFarmVal: boolean | null = typeof payload?.hasFarm === "boolean" ? payload.hasFarm : null;
              if (hasFarmVal == null) {
                if (payload?.requiresFarmCreation === true) hasFarmVal = false;
                else if (payload?.currentFarm != null) hasFarmVal = true;
              }

              setRoleAndFarm({
                role: roleName,
                hasFarm: hasFarmVal,
                farmId: payload?.farmId ?? payload?.currentFarm?.id ?? null,
                farmName: payload?.currentFarm?.farmName ?? null,
              });

              setUserData({
                name: payload?.name ?? null,
                email: payload?.email ?? null,
                profilePicture: payload?.profilePicture ?? null,
              });

              if (payload.permissions) {
                useAuth.getState().setPermissions(payload.permissions);
              }
            } catch (err) {
              console.error("Failed to fetch extended user data:", err);
            }
          })();
        }
      }
    }, [status, nextAuthSession, setToken, setIsSubscribed, setUserId, setRoleAndFarm, setUserData]);

    return null;
  }

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}

export default AuthSessionProvider;
