"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ActionIcon,
    Group,
    Modal,
    ScrollArea,
    Stack,
    Text,
} from "@mantine/core";
import BaseButton from "@/components/ui/BaseButton";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import CreateFarmModal from "./CreateFarmModal";

interface Farm {
    id: string;
    farmId?: string;
    farmName?: string;
    name?: string;
}

interface FarmSwitcherModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function FarmSwitcherModal({
    opened,
    onClose,
}: FarmSwitcherModalProps) {
    const router = useRouter();
    const { farmId, setRoleAndFarm, role, setUserData, setPermissions } =
        useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const queryClient = useQueryClient();

    // Check if user has owner role - only owners can create farms
    // Strict check: role must exist and be exactly "OWNER" (case-insensitive)
    const isOwner = Boolean(
        role && String(role).trim().toUpperCase() === "OWNER"
    );

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["owner-farms"],
        queryFn: async () => {
            const res = await api.get("/api/v1/farms");
            return (res?.data?.data ?? res?.data ?? []) as Farm[];
        },
        enabled: opened,
    });

    const farms = Array.isArray(data) ? data : [];

    const selectFarm = async (f: Farm) => {
        const nextId = f.id ?? f.farmId ?? null;
        if (!nextId) return;
        try {
            // Switch farm on backend
            await api.post("/api/v1/farms/switch", { farmId: nextId });

            // Fetch updated user data including permissions and role
            try {
                const me = await api.get("/api/v1/auth/me");
                const meData = me?.data ?? {};
                const payload = meData?.data ?? meData;

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
                    payload?.user?.roleName ||
                    null;

                // Derive hasFarm
                let hasFarmVal: boolean | null =
                    typeof payload?.hasFarm === "boolean"
                        ? payload.hasFarm
                        : null;
                if (hasFarmVal == null) {
                    if (payload?.requiresFarmCreation === true)
                        hasFarmVal = false;
                    else if (payload?.currentFarm != null) hasFarmVal = true;
                }

                const updatedFarmId =
                    payload?.farmId ??
                    payload?.defaultFarmId ??
                    payload?.currentFarm?.id ??
                    payload?.user?.farmId ??
                    payload?.data?.farmId ??
                    nextId;

                const farmName =
                    payload?.currentFarm?.farmName ??
                    payload?.currentFarm?.name ??
                    null;

                // Update auth store with fresh data
                setRoleAndFarm({
                    role: roleName ?? null,
                    hasFarm:
                        typeof hasFarmVal === "boolean" ? hasFarmVal : null,
                    farmId: updatedFarmId,
                    farmName,
                });

                // Update user data
                setUserData({
                    name: payload?.name ?? null,
                    email: payload?.email ?? null,
                    profilePicture: payload?.profilePicture ?? null,
                });

                // Update permissions
                const permissions = Array.isArray(payload?.permissions)
                    ? payload.permissions
                    : Array.isArray(payload?.user?.permissions)
                      ? payload.user.permissions
                      : [];
                setPermissions(permissions);
            } catch (meError) {
                // If /me fails, still update farmId as fallback
                setRoleAndFarm({ farmId: nextId, hasFarm: true });
            }

            // Invalidate all queries to ensure fresh data
            await queryClient.invalidateQueries();

            // Close modal
            onClose();

            // Refresh the page to reload all server components and update navigation tabs
            router.refresh();
        } catch (e) {
            // noop: you can add a toast here if desired
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title="Switch farm"
                centered
                size="md"
            >
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            {isLoading
                                ? "Loading farms..."
                                : `${farms.length} farm(s)`}
                        </Text>
                        {isOwner && (
                            <BaseButton
                                size="xs"
                                intent="secondary"
                                onClick={() => setCreateOpen(true)}
                            >
                                Create new farm
                            </BaseButton>
                        )}
                    </Group>

                    <ScrollArea.Autosize mah={320}>
                        <Stack gap="xs">
                            {farms.map((f) => {
                                const id = f.id ?? f.farmId ?? "";
                                const label = f.farmName ?? f.name ?? id;
                                const isActive = farmId && id && farmId === id;
                                return (
                                    <Group
                                        key={id}
                                        justify="space-between"
                                        style={{
                                            cursor: "pointer",
                                            padding: "8px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--mantine-color-gray-3)",
                                        }}
                                        onClick={() => selectFarm(f)}
                                    >
                                        <Text>{label}</Text>
                                        {isActive ? (
                                            <ActionIcon
                                                variant="subtle"
                                                color="brandGreen"
                                            >
                                                <IconCheck size={16} />
                                            </ActionIcon>
                                        ) : null}
                                    </Group>
                                );
                            })}
                            {!isLoading && farms.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    No farms yet. Create your first farm.
                                </Text>
                            ) : null}
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </Modal>

            <CreateFarmModal
                opened={createOpen}
                onClose={() => {
                    setCreateOpen(false);
                    void refetch();
                }}
                onCreated={() => {
                    setCreateOpen(false);
                    void refetch();
                }}
                closable
            />
        </>
    );
}
