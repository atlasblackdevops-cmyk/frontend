"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/stores/use-auth-store";
import { Container, Title, Text, Box, Card } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

interface OwnerOnlyProps {
    children: React.ReactNode;
    redirectTo?: string;
    showMessage?: boolean;
}

export function OwnerOnly({ 
    children, 
    redirectTo = "/dashboard",
    showMessage = true 
}: OwnerOnlyProps) {
    const router = useRouter();
    const { status } = useSession();
    const { token, role } = useAuth();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const isLoggedIn = status === "authenticated" || !!token;
    const isOwner = role && String(role).trim().toUpperCase() === "OWNER";

    useEffect(() => {
        if (!hydrated) return;
        
        // If not logged in at all, redirect to login
        if (status === "loading") return;
        if (!isLoggedIn) {
            router.replace("/login");
            return;
        }

        // If logged in but not owner, redirect to specified page
        if (role && !isOwner) {
            router.replace(redirectTo);
        }
    }, [hydrated, status, isLoggedIn, role, isOwner, router, redirectTo]);

    // Show nothing while hydrating or loading
    if (!hydrated || status === "loading") return null;

    // Show nothing if not logged in (will redirect)
    if (!isLoggedIn) return null;

    // If logged in but not owner
    if (role && !isOwner) {
        // Show access denied message if enabled, otherwise show nothing (will redirect)
        if (showMessage) {
            return (
                <Container size="sm" py={{ base: "xl", md: "4rem" }}>
                    <Card
                        p="xl"
                        radius="lg"
                        withBorder
                        style={{
                            textAlign: "center",
                        }}
                    >
                        <Box mb="lg">
                            <IconLock size={64} color="var(--mantine-color-red-6)" />
                        </Box>
                        <Title order={2} mb="md">
                            Access Denied
                        </Title>
                        <Text size="lg" c="dimmed" mb="md">
                            This page is only accessible to farm owners.
                        </Text>
                        <Text size="sm" c="dimmed">
                            You will be redirected shortly...
                        </Text>
                    </Card>
                </Container>
            );
        }
        return null;
    }

    // If role is not yet loaded, wait
    if (!role) return null;

    // If owner, show content
    return <>{children}</>;
}
