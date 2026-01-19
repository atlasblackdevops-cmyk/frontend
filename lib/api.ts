"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";
import { signOut } from "next-auth/react";

export const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (
    error: AxiosError | null,
    token: string | null = null
) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Function to refresh the token
const refreshToken = async (): Promise<string | null> => {
    try {
        if (typeof window === "undefined") return null;

        const refreshTokenValue = localStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
            // No refresh token available - redirect to login
            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
            return null;
        }

        const response = await axios.post(
            `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
            { refreshToken: refreshTokenValue },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const newAccessToken =
            response?.data?.accessToken ??
            response?.data?.token ??
            response?.data?.access_token ??
            response?.data?.data?.accessToken ??
            response?.data?.data?.token ??
            response?.data?.data?.access_token ??
            null;

        const newRefreshToken =
            response?.data?.refreshToken ??
            response?.data?.refresh_token ??
            response?.data?.data?.refreshToken ??
            response?.data?.data?.refresh_token ??
            null;

        if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            // Update auth store if available
            try {
                const { useAuth } = await import("@/stores/use-auth-store");
                useAuth.getState().setToken(newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                    useAuth.getState().setRefreshToken(newRefreshToken);
                }
            } catch {
                // ignore if store not available
            }
            
            // Dispatch event to update NextAuth session with new tokens
            // SessionSync component will listen to this and update the session
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("token-refreshed", {
                        detail: {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        },
                    })
                );
            }
            
            return newAccessToken;
        }

        return null;
    } catch (error: any) {
        // Refresh failed - this includes 401 (refresh token expired) or any other error
        // Clear tokens and redirect to login
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            // Clear auth store
            try {
                const { useAuth } = await import("@/stores/use-auth-store");
                useAuth.getState().setToken(null);
                useAuth.getState().setRefreshToken(null);
            } catch {
                // ignore if store not available
            }

            // Redirect to login page if refresh token expired or any other error
            // Don't redirect if already on login page or root page (public landing page)
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/"
            ) {
                // Use signOut to clear session cookie AND redirect to login
                void signOut({ callbackUrl: "/login", redirect: true });
            }
        }

        // Throw error to properly handle it in the interceptor
        throw error;
    }
};

// Request interceptor - add access token to requests
api.interceptors.request.use(async (config) => {
    try {
        if (typeof window !== "undefined") {
            // ALWAYS prioritize localStorage - it has the latest refreshed tokens
            // localStorage is the source of truth after token refresh
            let token = localStorage.getItem("accessToken");
            
            // If not in localStorage, try to get from auth store (might be syncing)
            if (!token) {
                try {
                    const { useAuth } = await import("@/stores/use-auth-store");
                    const authState = useAuth.getState();
                    token = authState.token;
                    // If we got token from store, sync it to localStorage for consistency
                    if (token) {
                        localStorage.setItem("accessToken", token);
                    }
                } catch {
                    // ignore if store not available
                }
            }
            
            // Only fall back to NextAuth session if localStorage and store are both empty
            // This should only happen on first load before SessionSync runs
            if (!token) {
                try {
                    const { getSession } = await import("next-auth/react");
                    const session = await getSession();
                    if (session) {
                        token = (session as any).accessToken;
                        // If we got token from session, sync it to localStorage
                        // This ensures localStorage becomes the source of truth
                        if (token) {
                            localStorage.setItem("accessToken", token);
                        }
                    }
                } catch {
                    // ignore if NextAuth not available
                }
            }
            
            if (token) {
                config.headers = config.headers ?? {};
                (config.headers as any).Authorization = `Bearer ${token}`;
            }
        }
    } catch {
        // ignore storage errors
    }
    return config;
});

// Response interceptor - handle token refresh and 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        // Handle CORS and network errors
        if (
            error.code === "ERR_NETWORK" ||
            error.message?.includes("Network Error") ||
            (!error.response && error.request)
        ) {
            console.error("Network/CORS Error:", {
                message: error.message,
                code: error.code,
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
                headers: error.config?.headers,
            });
            // Mark as CORS error for better error handling
            (error as any).isCorsError = true;
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 401 Unauthorized errors
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                if (newToken) {
                    processQueue(null, newToken);
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return api(originalRequest);
                } else {
                    // No token available - refresh failed or no refresh token
                    processQueue(error, null);
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // Refresh failed - redirect already happened in refreshToken
                processQueue(refreshError as AxiosError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 401 errors that weren't handled above (edge cases)
        // This handles cases where we can't retry (no originalRequest or already retried)
        // or when the refresh attempt failed and we need to redirect
        if (error.response?.status === 401) {
            // If we get here, it means either:
            // 1. The request doesn't have a config (edge case)
            // 2. The request was already retried and failed again
            // In either case, redirect to login
            // Don't redirect if already on login page or root page (public landing page)
            if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/"
            ) {
                // Clear tokens
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                try {
                    const { useAuth } = await import("@/stores/use-auth-store");
                    useAuth.getState().setToken(null);
                    useAuth.getState().setRefreshToken(null);
                } catch {
                    // ignore if store not available
                }

                // Redirect to login
                void signOut({ callbackUrl: "/login", redirect: true });
            }
        }

        return Promise.reject(error);
    }
);
