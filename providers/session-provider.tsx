"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useAuth } from "../stores/use-auth-store";
import { AxiosError } from "axios";

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
        const pathname = usePathname();

        // Refs to prevent multiple simultaneous calls and loops
        const isFetchingMeRef = useRef(false);
        const isLoggingOutRef = useRef(false);
        const hasHandledAuthRef = useRef(false);

        useEffect(() => {
            // Don't run on public routes (login, register) or if already logging out
            const isPublicRoute =
                pathname === "/login" ||
                pathname === "/register" ||
                pathname === "/";
            if (isPublicRoute || isLoggingOutRef.current) {
                return;
            }

            // Handle unauthenticated state - clear auth store if needed
            if (status === "unauthenticated") {
                if (hasHandledAuthRef.current) {
                    return; // Already handled
                }

                if (typeof window !== "undefined") {
                    const storedToken = localStorage.getItem("accessToken");
                    // Only clear if we have a token but NextAuth says we're not authenticated
                    // This indicates a session mismatch
                    if (storedToken && !pathname.includes("/login")) {
                        console.log(
                            "[SessionSync] NextAuth unauthenticated but token exists. Clearing state."
                        );
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        setToken(null);
                        setRefreshToken(null);
                        setRoleAndFarm({
                            role: null,
                            hasFarm: null,
                            farmId: null,
                            farmName: null,
                        });
                        setUserData({
                            name: null,
                            email: null,
                            profilePicture: null,
                        });
                        hasHandledAuthRef.current = true;
                    }
                }
                return;
            }

            if (status === "authenticated" && nextAuthSession) {
                const accessToken = (nextAuthSession as any).accessToken;
                const isSubscribed =
                    (nextAuthSession as any).isSubscribed === true;
                const uid = (nextAuthSession.user as any)?.id;

                // CHECK IF USER MANUALLY CLEARED STORAGE
                if (typeof window !== "undefined") {
                    const storedToken = localStorage.getItem("accessToken");
                    const isLoggingIn =
                        sessionStorage.getItem("is_logging_in") === "true";

                    if (!storedToken && !isLoggingIn) {
                        console.log(
                            "[SessionSync] LocalStorage is empty. Triggering signOut to match manual clearing."
                        );
                        isLoggingOutRef.current = true;
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
                hasHandledAuthRef.current = true;

                // Fetch user metadata if role/farm info is missing
                const currentAuthState = useAuth.getState();
                const needsMeCall =
                    accessToken &&
                    (currentAuthState.role === null ||
                        currentAuthState.hasFarm === null) &&
                    !isFetchingMeRef.current &&
                    !isLoggingOutRef.current;

                if (needsMeCall) {
                    isFetchingMeRef.current = true;
                    (async () => {
                        try {
                            // Double-check we're not logging out before making the call
                            if (
                                isLoggingOutRef.current ||
                                !localStorage.getItem("accessToken")
                            ) {
                                isFetchingMeRef.current = false;
                                return;
                            }

                            const res = await api.get("/api/v1/auth/me");
                            const payload = res.data?.data ?? res.data;

                            // Normalize role name
                            const rawRole =
                                payload?.role ??
                                payload?.user?.role ??
                                payload?.data?.role ??
                                null;
                            const roleName =
                                (typeof rawRole === "string" && rawRole) ||
                                rawRole?.roleName ||
                                rawRole?.name ||
                                null;

                            // Derive hasFarm
                            let hasFarmVal: boolean | null =
                                typeof payload?.hasFarm === "boolean"
                                    ? payload.hasFarm
                                    : null;
                            if (hasFarmVal == null) {
                                if (payload?.requiresFarmCreation === true)
                                    hasFarmVal = false;
                                else if (payload?.currentFarm != null)
                                    hasFarmVal = true;
                            }

                            setRoleAndFarm({
                                role: roleName,
                                hasFarm: hasFarmVal,
                                farmId:
                                    payload?.farmId ??
                                    payload?.currentFarm?.id ??
                                    null,
                                farmName:
                                    payload?.currentFarm?.farmName ?? null,
                            });

                            setUserData({
                                name: payload?.name ?? null,
                                email: payload?.email ?? null,
                                profilePicture: payload?.profilePicture ?? null,
                            });

                            if (payload.permissions) {
                                useAuth
                                    .getState()
                                    .setPermissions(payload.permissions);
                            }
                        } catch (err: any) {
                            const axiosError = err as AxiosError;

                            // Handle 401 - token expired/invalid
                            if (axiosError.response?.status === 401) {
                                console.log(
                                    "[SessionSync] /me returned 401. Token expired/invalid. Clearing state and signing out."
                                );
                                isLoggingOutRef.current = true;

                                // Clear all auth state
                                if (typeof window !== "undefined") {
                                    localStorage.removeItem("accessToken");
                                    localStorage.removeItem("refreshToken");
                                    sessionStorage.removeItem("is_logging_in");
                                }

                                setToken(null);
                                setRefreshToken(null);
                                setRoleAndFarm({
                                    role: null,
                                    hasFarm: null,
                                    farmId: null,
                                    farmName: null,
                                });
                                setUserData({
                                    name: null,
                                    email: null,
                                    profilePicture: null,
                                });

                                // Sign out and redirect (this will be handled by API interceptor too, but doing it here prevents loop)
                                // Only redirect if not already on login page
                                if (pathname !== "/login" && pathname !== "/") {
                                    void signOut({
                                        callbackUrl: "/login",
                                        redirect: true,
                                    });
                                }
                                return; // Exit early to prevent further execution
                            }

                            // For other errors, just log (network errors, etc.)
                            console.error(
                                "[SessionSync] Failed to fetch extended user data:",
                                err
                            );
                        } finally {
                            isFetchingMeRef.current = false;
                        }
                    })();
                }
            }
        }, [
            status,
            nextAuthSession,
            setToken,
            setIsSubscribed,
            setUserId,
            setRoleAndFarm,
            setUserData,
            pathname,
        ]);

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
