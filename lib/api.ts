"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";

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
            if (window.location.pathname !== "/login") {
                // Use replace to avoid adding to history
                window.location.replace("/login");
            }
        }

        // Throw error to properly handle it in the interceptor
        throw error;
    }
};

// Request interceptor - add access token to requests
api.interceptors.request.use((config) => {
    try {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
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
            if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
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
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);
