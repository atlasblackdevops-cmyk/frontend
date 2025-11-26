"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useAuth } from "../stores/use-auth-store";

interface Props {
  children: ReactNode;
  session?: Session | null;
}

function AuthSessionProvider({ children, session }: Props) {
  function SessionSync() {
    const router = useRouter();
    const { setToken, setUserId, setRoleAndFarm } = useAuth();
    const { token } = useAuth();
    const { data: nextAuthSession, status } = useSession();

    useEffect(() => {
      if (status === "authenticated") {
        const uid = (nextAuthSession?.user as any)?.id ?? null;
        setUserId(uid);

        const idToken = (nextAuthSession as any)?.googleIdToken as
          | string
          | undefined;

        if (idToken && !token) {
          (async () => {
            try {
              const { data } = await api.post("/api/v1/auth/google", {
                idToken,
              });
              const backendToken =
                // flat payloads
                data?.accessToken ??
                data?.token ??
                data?.jwt ??
                data?.access_token ??
                // nested payloads: { message, data: { accessToken, ... } }
                data?.data?.accessToken ??
                data?.data?.token ??
                data?.data?.jwt ??
                data?.data?.access_token ??
                null;
              if (backendToken) {
                setToken(backendToken);
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("accessToken", backendToken);
                  }
                } catch {
                  // ignore storage errors
                }
              }
              // Hydrate role/hasFarm after setting token
              try {
                const me = await api.get("/api/v1/auth/me");
                const meData = me?.data ?? {};
                const payload = meData?.data ?? meData;

                // Normalize role name from various shapes
                const rawRole =
                  payload?.role ??
                  payload?.user?.role ??
                  payload?.data?.role ??
                  null;
                const roleName =
                  (typeof rawRole === "string" && rawRole) ||
                  rawRole?.roleName ||
                  rawRole?.name ||
                  payload?.user?.roleName ||
                  null;

                // Derive hasFarm with fallbacks
                let hasFarmVal: boolean | null =
                  typeof payload?.hasFarm === "boolean"
                    ? payload.hasFarm
                    : null;
                if (hasFarmVal == null) {
                  if (payload?.requiresFarmCreation === true)
                    hasFarmVal = false;
                  else if (payload?.currentFarm != null) hasFarmVal = true;
                }

                const farmId =
                  payload?.farmId ??
                  payload?.defaultFarmId ??
                  payload?.currentFarm?.id ??
                  payload?.user?.farmId ??
                  payload?.data?.farmId ??
                  null;

                setRoleAndFarm({
                  role: roleName ?? null,
                  hasFarm: typeof hasFarmVal === "boolean" ? hasFarmVal : null,
                  farmId,
                });
                // Navigate to dashboard; FarmGate will show modal if owner without farm
                router.push("/dashboard");
              } catch {
                // Fallback: navigate to dashboard even if /me fails
                router.push("/dashboard");
              }
            } catch (err: any) {
              const message =
                err?.response?.data?.message ??
                err?.message ??
                "Google sign-in failed";

              // If backend indicates the Google ID token is expired or invalid, prompt re-auth
              if (
                typeof message === "string" &&
                /expired|id[_-]?token/i.test(message)
              ) {
                // Minimal prompt to the user, then trigger a fresh Google sign-in
                if (typeof window !== "undefined") {
                  // Avoid blocking if alerts are undesirable; replace with your toast system if available
                  // eslint-disable-next-line no-alert
                  window.alert(
                    "Your Google session expired. Please sign in again."
                  );
                }
                void signIn("google", {
                  callbackUrl: "/dashboard",
                  prompt: "consent",
                  max_age: 300,
                });
                return;
              }

              // Non-expiry errors: log for debugging; UI can decide how to handle missing backend token
              // eslint-disable-next-line no-console
              console.error("Google auth exchange failed:", message);
            }
          })();
        }
      } else if (status === "unauthenticated") {
        // Only clear NextAuth-derived identifiers; keep custom tokens (email/password) intact
        setUserId(null);
      }
      // Note: do not include nextAuthSession in deps to avoid effect re-running on every render
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, token]);

    // Hydrate token from storage on mount if missing (email/password sessions)
    // Also fetch user's role and farm status when token is available
    useEffect(() => {
      if (!token && typeof window !== "undefined") {
        const stored =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");
        if (stored) {
          setToken(stored);
        }
      }
    }, [token, setToken]);

    // Fetch user's auth state (role, hasFarm) when token is available but state is missing
    useEffect(() => {
      const { role, hasFarm } = useAuth.getState();
      if (token && (role === null || hasFarm === null)) {
        (async () => {
          try {
            const me = await api.get("/api/v1/auth/me");
            const meData = me?.data ?? {};
            const payload = meData?.data ?? meData;

            // Normalize role name from various shapes
            const rawRole =
              payload?.role ??
              payload?.user?.role ??
              payload?.data?.role ??
              null;
            const roleName =
              (typeof rawRole === "string" && rawRole) ||
              rawRole?.roleName ||
              rawRole?.name ||
              payload?.user?.roleName ||
              null;

            // Derive hasFarm with fallbacks
            let hasFarmVal: boolean | null =
              typeof payload?.hasFarm === "boolean" ? payload.hasFarm : null;
            if (hasFarmVal == null) {
              if (payload?.requiresFarmCreation === true) hasFarmVal = false;
              else if (payload?.currentFarm != null) hasFarmVal = true;
            }

            const farmId =
              payload?.farmId ??
              payload?.defaultFarmId ??
              payload?.currentFarm?.id ??
              payload?.user?.farmId ??
              payload?.data?.farmId ??
              null;

            setRoleAndFarm({
              role: roleName ?? null,
              hasFarm: typeof hasFarmVal === "boolean" ? hasFarmVal : null,
              farmId,
            });
          } catch (err) {
            // If /me fails, user might not be authenticated - clear token
            // eslint-disable-next-line no-console
            console.error("Failed to fetch user auth state:", err);
            // Optionally clear token if it's invalid
            // setToken(null);
          }
        })();
      }
    }, [token, setRoleAndFarm]);

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
