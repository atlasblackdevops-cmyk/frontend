"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import {
    Alert,
    Anchor,
    Checkbox,
    Divider,
    Stack,
    Text,
} from "@mantine/core";
import { BaseInput } from "@/components/ui";
import { BasePasswordInput } from "@/components/ui";
import { BaseButton } from "@/components/ui";
import { upperFirst, useToggle } from "@mantine/hooks";
import BaseCard, { BaseCardProps } from "@/components/ui/BaseCard";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import { GoogleButton } from "./GoogleButton";

function resolveFieldKey(rawKey: string | undefined): string | undefined {
    if (!rawKey) return rawKey;
    const key = String(rawKey)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
    if (key.includes("email")) return "email";
    if (key.includes("pass")) return "password";
    if (key.includes("name")) return "name";
    if (
        key.includes("term") ||
        key.includes("agree") ||
        key.includes("condition")
    )
        return "terms";
    return rawKey;
}

function mapApiErrorsToFormErrors(data: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    if (!data) return fieldErrors;

    const pushError = (key: string | undefined, value: unknown) => {
        const resolvedKey = resolveFieldKey(key);
        if (!resolvedKey) return;
        const existing = fieldErrors[resolvedKey];
        const next = Array.isArray(value)
            ? value.filter(Boolean).join(", ")
            : typeof value === "object" && value !== null
              ? Object.values(value as Record<string, unknown>)
                    .filter((v) => typeof v === "string")
                    .join(", ")
              : (value as string | undefined);
        if (!next) return;
        fieldErrors[resolvedKey] = existing ? `${existing}; ${next}` : next;
    };

    // Collect possible containers that may hold field errors
    const containers: unknown[] = [
        data?.errors,
        data?.error,
        data?.data?.errors,
        data?.data?.error,
    ].filter((c) => c != null);

    for (const container of containers) {
        // Object map form: { email: "msg", password: ["m1","m2"] }
        if (
            container &&
            !Array.isArray(container) &&
            typeof container === "object"
        ) {
            for (const [k, v] of Object.entries(
                container as Record<string, unknown>
            )) {
                pushError(k, v);
            }
            continue;
        }

        // Array form
        if (Array.isArray(container)) {
            for (const entry of container as any[]) {
                if (!entry) continue;

                // Pair: ["email","msg"]
                if (Array.isArray(entry) && entry.length >= 2) {
                    const [k, v] = entry;
                    pushError(k, v);
                    continue;
                }

                if (typeof entry === "object") {
                    // Common shapes:
                    // { field: "email", message: "msg" }
                    // { property: "email", constraints: { isEmail: "msg" } }
                    // { key: "email", value: "msg" }
                    // { email: "msg" }
                    const key =
                        (entry.field as string) ??
                        (entry.property as string) ??
                        (entry.key as string);

                    const value =
                        entry.message ??
                        entry.value ??
                        (entry.constraints &&
                        typeof entry.constraints === "object"
                            ? Object.values(entry.constraints).join(", ")
                            : undefined) ??
                        (key ? undefined : Object.values(entry)[0]);

                    if (key) {
                        pushError(key, value);
                        continue;
                    }

                    // Fallback: spread any key=>value pairs
                    for (const [k, v] of Object.entries(entry)) {
                        pushError(k, v);
                    }
                }
            }
        }
    }

    return fieldErrors;
}

function buildValidation(type: "login" | "register") {
    return {
        email: (value: string) => {
            if (!value || value.trim().length === 0) {
                return "Email is required";
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim().toLowerCase())) {
                return "Invalid email";
            }
            return null;
        },
        password: (value: string) => {
            if (!value || value.length === 0) {
                return "Password is required";
            }
            if (value.length < 6) {
                return "Password should include at least 6 characters";
            }
            return null;
        },
        name: (value: string) => {
            if (type === "register") {
                if (!value || value.trim().length === 0) {
                    return "Name is required";
                }
                if (value.trim().length < 2) {
                    return "Name should include at least 2 characters";
                }
            }
            return null;
        },
        terms: (value: boolean) => {
            if (type === "register" && !value) {
                return "You must accept terms and conditions";
            }
            return null;
        },
    };
}

export function AuthenticationForm({
    initialType,
    ...paperProps
}: BaseCardProps & { initialType?: "login" | "register" }) {
    const toggleValues: Array<"login" | "register"> =
        initialType === "login" ? ["login", "register"] : ["register", "login"];
    const [type, toggle] = useToggle<"login" | "register">(toggleValues);
    const router = useRouter();
    const { setToken, setRefreshToken } = useAuth();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [status, setStatus] = React.useState<string | undefined>(undefined);

    const form = useForm({
        initialValues: {
            email: "",
            name: "",
            password: "",
            terms: true,
        },
        validateInputOnBlur: true,
        validate: (values) => {
            const validation = buildValidation(type);
            const errors: Record<string, string | null> = {};
            
            const emailError = validation.email(values.email);
            if (emailError) errors.email = emailError;
            
            const passwordError = validation.password(values.password);
            if (passwordError) errors.password = passwordError;
            
            const nameError = validation.name(values.name);
            if (nameError) errors.name = nameError;
            
            const termsError = validation.terms(values.terms);
            if (termsError) errors.terms = termsError;
            
            return Object.keys(errors).length > 0 ? errors : {};
        },
    });

    // Update form when type changes
    React.useEffect(() => {
        const currentEmail = form.values.email;
        const currentPassword = form.values.password;
        form.setValues({
            email: currentEmail,
            name: "",
            password: currentPassword,
            terms: true,
        });
        form.clearErrors();
    }, [type]);

    return (
        <BaseCard
            radius={6}
            p={{ base: "xl", sm: "xl" }}
            withBorder={false}
            style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxHeight: "calc(100dvh - 200px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
            {...paperProps}
        >
            <GoogleButton fullWidth>
                Sign in with Google
            </GoogleButton>

            <Divider
                label="Or continue with email"
                labelPosition="center"
                my="lg"
                color="rgba(255, 255, 255, 0.2)"
                styles={{
                    label: {
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "13px",
                        padding: "0 16px",
                        fontWeight: 500,
                        backgroundColor: "transparent",
                    },
                }}
            />

            <form
                onSubmit={form.onSubmit(async (values) => {
                    try {
                        setIsSubmitting(true);
                        setStatus(undefined);
                        const payload = {
                            email: values.email.trim().toLowerCase(),
                            password: values.password,
                            name: values.name.trim(),
                        };

                        if (type === "register") {
                            await api.post("/api/v1/auth/register", {
                                email: payload.email,
                                password: payload.password,
                                name: payload.name,
                            });
                            setIsSubmitting(false);
                            form.reset();
                            toggle(); // Switch to login after successful register
                            return;
                        }

                        const { data } = await api.post("/api/v1/auth/login", {
                            email: payload.email,
                            password: payload.password,
                        });

                        const backendToken =
                            data?.accessToken ??
                            data?.token ??
                            data?.jwt ??
                            data?.access_token ??
                            data?.data?.accessToken ??
                            data?.data?.token ??
                            data?.data?.jwt ??
                            data?.data?.access_token ??
                            null;

                        const backendRefreshToken =
                            data?.refreshToken ??
                            data?.refresh_token ??
                            data?.data?.refreshToken ??
                            data?.data?.refresh_token ??
                            null;

                        if (backendToken) {
                            setToken(backendToken);
                            if (backendRefreshToken) {
                                setRefreshToken(backendRefreshToken);
                            }
                            try {
                                if (typeof window !== "undefined") {
                                    localStorage.setItem(
                                        "accessToken",
                                        backendToken
                                    );
                                    if (backendRefreshToken) {
                                        localStorage.setItem(
                                            "refreshToken",
                                            backendRefreshToken
                                        );
                                    }
                                }
                            } catch {
                                // ignore storage errors
                            }
                        }

                        try {
                            const me = await api.get("/api/v1/auth/me");
                            const meData = me?.data ?? {};
                            const payload = meData?.data ?? meData;

                            // Normalize role to string (matching Google flow)
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

                            // Derive hasFarm using multiple signals
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

                            const farmId =
                                payload?.farmId ??
                                payload?.defaultFarmId ??
                                payload?.currentFarm?.id ??
                                payload?.user?.farmId ??
                                payload?.data?.farmId ??
                                null;

                            const farmName =
                                payload?.currentFarm?.farmName ??
                                payload?.currentFarm?.name ??
                                null;

                            // Persist to auth store (same as Google flow)
                            try {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                useAuth.getState().setRoleAndFarm({
                                    role: roleName ?? null,
                                    hasFarm:
                                        typeof hasFarmVal === "boolean"
                                            ? hasFarmVal
                                            : null,
                                    farmId,
                                    farmName,
                                });
                                // Store user data (name, email, profilePicture)
                                useAuth.getState().setUserData({
                                    name: payload?.name ?? null,
                                    email: payload?.email ?? null,
                                    profilePicture:
                                        payload?.profilePicture ?? null,
                                });
                                // Store permissions if available
                                const permissions = Array.isArray(
                                    payload?.permissions
                                )
                                    ? payload.permissions
                                    : Array.isArray(payload?.user?.permissions)
                                      ? payload.user.permissions
                                      : [];
                                useAuth.getState().setPermissions(permissions);
                            } catch {}
                            // Always navigate to dashboard; FarmGate will show modal if owner without farm
                            router.push("/dashboard");
                        } catch {
                            // Fallback: navigate to dashboard even if /me fails
                            router.push("/dashboard");
                        }
                    } catch (err: any) {
                        const data = err?.response?.data;
                        const fieldErrors = mapApiErrorsToFormErrors(data);

                        if (Object.keys(fieldErrors).length > 0) {
                            // Split known field errors and unknown keys to show globally
                            const knownFields = new Set([
                                "email",
                                "password",
                                "name",
                                "terms",
                            ]);
                            const known: Record<string, string> = {};
                            const unknownMessages: string[] = [];

                            for (const [k, v] of Object.entries(fieldErrors)) {
                                if (knownFields.has(k)) {
                                    known[k] = v as string;
                                } else if (typeof v === "string") {
                                    unknownMessages.push(v as string);
                                }
                            }

                            if (Object.keys(known).length > 0) {
                                form.setErrors(known);
                            }
                            if (unknownMessages.length > 0) {
                                setStatus(unknownMessages.join("; "));
                            }

                            setIsSubmitting(false);
                            return;
                        }

                        const message =
                            data?.message ||
                            err?.message ||
                            (type === "register"
                                ? "Registration failed"
                                : "Login failed");

                        form.setFieldError("email", message);
                        setStatus(message);
                        setIsSubmitting(false);
                    }
                })}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {status ? (
                    <Alert
                        color="red"
                        variant="light"
                        mb="md"
                        radius={6}
                        style={{ 
                            flexShrink: 0,
                            border: "1px solid rgba(255, 87, 87, 0.3)",
                            backgroundColor: "rgba(255, 87, 87, 0.15)",
                            backdropFilter: "blur(4px)",
                        }}
                        styles={{
                            message: {
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.95)",
                            },
                        }}
                    >
                        {status}
                    </Alert>
                ) : null}
                <Stack
                    gap="md"
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    {type === "register" && (
                        <BaseInput
                            label="Name"
                            placeholder="Enter your full name"
                            required
                            styles={{
                                label: {
                                    color: "rgba(255, 255, 255, 0.9)",
                                },
                                input: {
                                    color: "rgba(255, 255, 255, 0.95)",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    "&::placeholder": {
                                        color: "rgba(255, 255, 255, 0.6)",
                                    },
                                    "&:focus": {
                                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                    },
                                },
                            }}
                            {...form.getInputProps("name")}
                        />
                    )}

                    <BaseInput
                        required
                        label="Email"
                        placeholder="Enter your email"
                        styles={{
                            label: {
                                color: "rgba(255, 255, 255, 0.9)",
                            },
                            input: {
                                color: "rgba(255, 255, 255, 0.95)",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                "&::placeholder": {
                                    color: "rgba(255, 255, 255, 0.6)",
                                },
                                "&:focus": {
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                },
                            },
                        }}
                        {...form.getInputProps("email")}
                    />

                    <BasePasswordInput
                        required
                        label="Password"
                        placeholder="Enter your password"
                        styles={{
                            label: {
                                color: "rgba(255, 255, 255, 0.9)",
                            },
                            input: {
                                color: "rgba(255, 255, 255, 0.95)",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                "&::placeholder": {
                                    color: "rgba(255, 255, 255, 0.6)",
                                },
                                "&:focus": {
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                },
                            },
                        }}
                        {...form.getInputProps("password")}
                    />

                    {type === "register" && (
                        <Checkbox
                            label="I accept terms and conditions"
                            {...form.getInputProps("terms", { type: "checkbox" })}
                            error={form.errors.terms}
                            color="lime"
                            radius={6}
                            styles={{
                                label: {
                                    color: "rgba(255, 255, 255, 0.9)",
                                    fontSize: "14px",
                                    fontWeight: 400,
                                },
                                input: {
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "&:checked": {
                                        backgroundColor: "#4caf50",
                                        borderColor: "#4caf50",
                                    },
                                },
                                error: {
                                    fontSize: "12px",
                                    marginTop: "4px",
                                    color: "rgba(255, 255, 255, 0.9)",
                                },
                            }}
                        />
                    )}
                </Stack>

                <Stack gap="md" mt="xl" style={{ flexShrink: 0 }}>
                    <BaseButton
                        type="submit"
                        loading={isSubmitting}
                        color="green"
                        fullWidth
                        size="md"
                        styles={{
                            root: {
                                backgroundColor: "#4caf50",
                                border: "none",
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                                fontSize: "15px",
                                padding: "14px 24px",
                                height: "48px",
                                "&:hover": {
                                    backgroundColor: "#45a049",
                                    transform: "none",
                                },
                                "&:active": {
                                    backgroundColor: "#388e3c",
                                },
                            },
                        }}
                    >
                        {upperFirst(type)}
                    </BaseButton>

                    <Anchor
                        component="button"
                        type="button"
                        c="lime.3"
                        onClick={() => {
                            form.reset();
                            toggle();
                        }}
                        size="sm"
                        fw={500}
                        ta="center"
                        style={{
                            fontSize: "14px",
                            textDecoration: "none",
                        }}
                        styles={{
                            root: {
                                "&:hover": {
                                    textDecoration: "underline",
                                    color: "lime.2",
                                },
                            },
                        }}
                    >
                        {type === "register"
                            ? "Already have an account? Sign in"
                            : "Don't have an account? Sign up"}
                    </Anchor>
                </Stack>
            </form>
        </BaseCard>
    );
}
