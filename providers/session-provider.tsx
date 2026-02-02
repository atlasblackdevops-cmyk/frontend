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
        const { data: nextAuthSession, status, update: updateSession } = useSession();
        const pathname = usePathname();

        // Refs to prevent multiple simultaneous calls and loops
        const isFetchingMeRef = useRef(false);
        const isLoggingOutRef = useRef(false);
        const hasHandledAuthRef = useRef(false);

        // Listen for token refresh events and update NextAuth session
        useEffect(() => {
            const handleTokenRefresh = async (event: Event) => {
                const customEvent = event as CustomEvent<{
                    accessToken: string;
                    refreshToken?: string;
                }>;
                const { accessToken, refreshToken: newRefreshToken } = customEvent.detail;
                
                if (accessToken && status === "authenticated") {
                    // Update NextAuth session with new tokens
                    // This ensures the session cookie has the latest tokens
                    try {
                        await updateSession({
                            accessToken,
                            refreshToken: newRefreshToken,
                        });
                    } catch (error) {
                        // Silently fail - localStorage is the source of truth anyway
                    }
                }
            };

            window.addEventListener("token-refreshed", handleTokenRefresh);
            return () => {
                window.removeEventListener("token-refreshed", handleTokenRefresh);
            };
        }, [status, updateSession]);

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
                const refreshToken = (nextAuthSession as any).refreshToken;
                const isSubscribed =
                    (nextAuthSession as any).isSubscribed === true;
                const uid = (nextAuthSession.user as any)?.id;

                if (typeof window !== "undefined") {
                    // ALWAYS prioritize localStorage tokens over NextAuth session tokens
                    // This is because localStorage has the latest refreshed tokens
                    // NextAuth session might have stale tokens from before refresh
                    const storedAccessToken = localStorage.getItem("accessToken");
                    const storedRefreshToken = localStorage.getItem("refreshToken");

                    // Use localStorage token if it exists (it's the source of truth after refresh)
                    if (storedAccessToken) {
                        setToken(storedAccessToken);
                        // Clear the "is_logging_in" flag once we've synced
                        sessionStorage.removeItem("is_logging_in");
                    } else if (accessToken) {
                        // Only sync from NextAuth session if localStorage is empty
                        // This happens on first load or if localStorage was cleared
                        setToken(accessToken);
                        localStorage.setItem("accessToken", accessToken);
                        sessionStorage.removeItem("is_logging_in");
                    }

                    // Same logic for refresh token
                    if (storedRefreshToken) {
                        setRefreshToken(storedRefreshToken);
                    } else if (refreshToken) {
                        setRefreshToken(refreshToken);
                        localStorage.setItem("refreshToken", refreshToken);
                    }
                } else {
                    // Server-side: just sync from session
                    if (accessToken) {
                        setToken(accessToken);
                    }
                    if (refreshToken) {
                        setRefreshToken(refreshToken);
                    }
                }

                setIsSubscribed(isSubscribed);
                setUserId(uid ?? null);
                hasHandledAuthRef.current = true;

                // Fetch user metadata if role/farm info is missing
                const currentAuthState = useAuth.getState();
                // Check if we have a token (API interceptor will use the latest from localStorage)
                const hasToken = 
                    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
                    accessToken;
                const needsMeCall =
                    hasToken &&
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

                            // Store referral data
                            if (payload?.referralCode || payload?.totalReferrals !== undefined) {
                                useAuth.getState().setReferralData({
                                    referralCode: payload?.referralCode || null,
                                    totalReferralPoints: payload?.totalReferralPoints || 0,
                                    availableReferralPoints: payload?.availableReferralPoints || 0,
                                    totalReferrals: payload?.totalReferrals || 0,
                                    successfulReferrals: payload?.successfulReferrals || 0,
                                    pendingReferrals: payload?.pendingReferrals || 0,
                                });
                            }

                            if (payload.permissions) {
                                useAuth
                                    .getState()
                                    .setPermissions(payload.permissions);
                            }
                        } catch (err: any) {
                            const axiosError = err as AxiosError;

                            // Handle 401 - token expired/invalid
                            if (axiosError.response?.status === 401) {
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

                            // For other errors, silently fail (network errors, etc.)
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
            setRefreshToken,
            setIsSubscribed,
            setUserId,
            setRoleAndFarm,
            setUserData,
            pathname,
        ]);

        return null;
    }

    return (
        <SessionProvider 
            session={session} 
            refetchOnWindowFocus={false}
        >
            <SessionSync />
            {children}
        </SessionProvider>
    );
}

export default AuthSessionProvider;
