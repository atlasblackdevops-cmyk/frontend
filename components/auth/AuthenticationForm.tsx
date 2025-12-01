"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import Joi from "joi";
import {
    Alert,
    Anchor,
    Button,
    Checkbox,
    Divider,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
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

function buildValidationSchema(type: "login" | "register") {
    const base = {
        email: Joi.string()
            .trim()
            .lowercase()
            .email({ tlds: false })
            .required()
            .messages({
                "string.email": "Invalid email",
                "any.required": "Email is required",
            }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Password should include at least 6 characters",
            "any.required": "Password is required",
        }),
    };

    if (type === "register") {
        return Joi.object({
            ...base,
            name: Joi.string().trim().min(2).required().messages({
                "string.min": "Name should include at least 2 characters",
                "any.required": "Name is required",
            }),
            terms: Joi.boolean().valid(true).required().messages({
                "any.only": "You must accept terms and conditions",
            }),
        });
    }

    return Joi.object({
        ...base,
        name: Joi.string().allow(""),
        terms: Joi.boolean().default(true),
    });
}

function joiValidate(values: any, type: "login" | "register") {
    const schema = buildValidationSchema(type);
    const { error, value } = schema.validate(values, { abortEarly: false });
    // Propagate normalized values (e.g., lowercase email)
    Object.assign(values, value);

    if (!error) return {};
    const errors: Record<string, string> = {};
    for (const detail of error.details) {
        const key = detail.path?.[0] as string | undefined;
        if (!key) continue;
        if (!errors[key]) errors[key] = detail.message;
    }
    return errors;
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

    return (
        <BaseCard
            radius={0}
            p={{ base: "xl", sm: "xl" }}
            withBorder={false}
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                width: "100%",
                maxHeight: "calc(100dvh - 200px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
            {...paperProps}
        >
            <GoogleButton radius={0} fullWidth>
                Sign in with Google
            </GoogleButton>

            <Divider
                label="Or continue with email"
                labelPosition="center"
                my="lg"
                color="#e0e0e0"
                styles={{
                    label: {
                        color: "#757575",
                        fontSize: "13px",
                        padding: "0 16px",
                        fontWeight: 500,
                        backgroundColor: "#ffffff",
                    },
                }}
            />

            <Formik
                enableReinitialize
                initialValues={{
                    email: "",
                    name: "",
                    password: "",
                    terms: true,
                }}
                validate={(values) => joiValidate(values, type)}
                onSubmit={async (
                    values,
                    { setErrors, setSubmitting, setTouched, setStatus }
                ) => {
                    try {
                        setStatus(undefined);
                        const payload = {
                            email: values.email.trim().toLowerCase(),
                            password: values.password,
                            name: values.name,
                        };

                        if (type === "register") {
                            await api.post("/api/v1/auth/register", {
                                email: payload.email,
                                password: payload.password,
                                name: payload.name,
                            });
                            setSubmitting(false);
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
                                const touchedFields: Record<string, boolean> =
                                    {};
                                for (const key of Object.keys(known))
                                    touchedFields[key] = true;
                                setTouched(touchedFields);
                                setErrors(known as any);
                            }
                            if (unknownMessages.length > 0) {
                                setStatus(unknownMessages.join("; "));
                            }

                            setSubmitting(false);
                            return;
                        }

                        const message =
                            data?.message ||
                            err?.message ||
                            (type === "register"
                                ? "Registration failed"
                                : "Login failed");

                        setTouched({ email: true });
                        setErrors({ email: message } as any);
                        setStatus(message);
                        setSubmitting(false);
                    }
                }}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    setFieldValue,
                    handleSubmit,
                    isSubmitting,
                    submitCount,
                    status,
                }) => (
                    <form
                        onSubmit={handleSubmit}
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
                                radius={0}
                                style={{ 
                                    flexShrink: 0,
                                    border: "1px solid #ffcdd2",
                                    backgroundColor: "#ffebee",
                                }}
                                styles={{
                                    message: {
                                        fontSize: "14px",
                                        color: "#c62828",
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
                                <TextInput
                                    label="Name"
                                    placeholder="Enter your full name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="name"
                                    error={
                                        (touched.name || submitCount > 0) &&
                                        (errors.name as any)
                                    }
                                    radius={0}
                                    size="md"
                                    styles={{
                                        input: {
                                            borderColor: "#e0e0e0",
                                            borderWidth: "1px",
                                            fontSize: "15px",
                                            padding: "12px 16px",
                                            backgroundColor: "#fafafa",
                                            transition: "all 0.2s ease",
                                            "&:focus": {
                                                borderColor: "#4caf50",
                                                backgroundColor: "#ffffff",
                                                borderWidth: "2px",
                                            },
                                        },
                                        label: {
                                            fontSize: "14px",
                                            marginBottom: "8px",
                                            fontWeight: 500,
                                            color: "#424242",
                                        },
                                        error: {
                                            fontSize: "13px",
                                            marginTop: "4px",
                                        },
                                    }}
                                />
                            )}

                            <TextInput
                                required
                                label="Email"
                                placeholder="Enter your email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="email"
                                error={
                                    (touched.email || submitCount > 0) &&
                                    (errors.email as any)
                                }
                                radius={0}
                                size="md"
                                styles={{
                                    input: {
                                        borderColor: "#e0e0e0",
                                        borderWidth: "1px",
                                        fontSize: "15px",
                                        padding: "12px 16px",
                                        backgroundColor: "#fafafa",
                                        transition: "all 0.2s ease",
                                        "&:focus": {
                                            borderColor: "#4caf50",
                                            backgroundColor: "#ffffff",
                                            borderWidth: "2px",
                                        },
                                    },
                                    label: {
                                        fontSize: "14px",
                                        marginBottom: "8px",
                                        fontWeight: 500,
                                        color: "#424242",
                                    },
                                    error: {
                                        fontSize: "13px",
                                        marginTop: "4px",
                                    },
                                }}
                            />

                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Enter your password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="password"
                                error={
                                    (touched.password || submitCount > 0) &&
                                    (errors.password as any)
                                }
                                radius={0}
                                size="md"
                                styles={{
                                    input: {
                                        borderColor: "#e0e0e0",
                                        borderWidth: "1px",
                                        fontSize: "15px",
                                        padding: "12px 16px",
                                        backgroundColor: "#fafafa",
                                        transition: "all 0.2s ease",
                                        "&:focus": {
                                            borderColor: "#4caf50",
                                            backgroundColor: "#ffffff",
                                            borderWidth: "2px",
                                        },
                                    },
                                    label: {
                                        fontSize: "14px",
                                        marginBottom: "8px",
                                        fontWeight: 500,
                                        color: "#424242",
                                    },
                                    error: {
                                        fontSize: "13px",
                                        marginTop: "4px",
                                    },
                                }}
                            />

                            {type === "register" && (
                                <Checkbox
                                    label="I accept terms and conditions"
                                    checked={values.terms}
                                    onChange={(event) =>
                                        setFieldValue(
                                            "terms",
                                            event.currentTarget.checked
                                        )
                                    }
                                    error={
                                        (touched.terms || submitCount > 0) &&
                                        (errors.terms as any)
                                    }
                                    color="green"
                                    radius={0}
                                    styles={{
                                        label: {
                                            color: "#424242",
                                            fontSize: "14px",
                                            fontWeight: 400,
                                        },
                                        input: {
                                            borderColor: "#e0e0e0",
                                            "&:checked": {
                                                backgroundColor: "#4caf50",
                                                borderColor: "#4caf50",
                                            },
                                        },
                                        error: {
                                            fontSize: "13px",
                                            marginTop: "4px",
                                        },
                                    }}
                                />
                            )}
                        </Stack>

                        <Stack gap="md" mt="xl" style={{ flexShrink: 0 }}>
                            <Button
                                type="submit"
                                radius={0}
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
                            </Button>

                            <Anchor
                                component="button"
                                type={undefined as any}
                                c="#4caf50"
                                onClick={() => toggle()}
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
                                            color: "#45a049",
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
                )}
            </Formik>
        </BaseCard>
    );
}
