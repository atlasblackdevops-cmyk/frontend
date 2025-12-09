"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconSearch, IconPlus, IconBuilding } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ActionIcon,
    Group,
    Modal,
    ScrollArea,
    Stack,
    Text,
    Paper,
    Badge,
    Loader,
    Center,
} from "@mantine/core";
import { Button } from "@mantine/core";
import { BaseInput } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import CreateFarmModal from "./CreateFarmModal";
import type { Farm, FarmSwitcherModalProps } from "./types";

export default function FarmSwitcherModal({
    opened,
    onClose,
}: FarmSwitcherModalProps) {
    const router = useRouter();
    const { farmId, setRoleAndFarm, role, setUserData, setPermissions, farmName } =
        useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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

    // Filter farms based on search query
    const filteredFarms = useMemo(() => {
        if (!searchQuery.trim()) return farms;
        const query = searchQuery.toLowerCase().trim();
        return farms.filter((f) => {
            const label = (f.farmName ?? f.name ?? "").toLowerCase();
            return label.includes(query);
        });
    }, [farms, searchQuery]);

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
                onClose={() => {
                    setSearchQuery("");
                    onClose();
                }}
                title={
                    <Group gap={8} align="center">
                        <IconBuilding size={18} color="var(--mantine-color-green-6)" />
                        <Text fw={700} size="md">Switch Farm</Text>
                    </Group>
                }
                centered
                size="md"
                styles={{
                    title: {
                        fontWeight: 700,
                    },
                    body: {
                        padding: "16px",
                    },
                }}
            >
                <Stack gap="md">
                    {/* Header Section */}
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed" fw={500}>
                                {isLoading ? (
                                    "Loading your farms..."
                                ) : (
                                    <>
                                        {farms.length === 0 ? (
                                            "No farms available"
                                        ) : searchQuery ? (
                                            <>
                                                Showing {filteredFarms.length} of {farms.length} farm{farms.length !== 1 ? "s" : ""}
                                            </>
                                        ) : (
                                            <>
                                                {farms.length} farm{farms.length !== 1 ? "s" : ""} available
                                            </>
                                        )}
                                    </>
                                )}
                            </Text>
                            {farmName && (
                                <Badge
                                    size="lg"
                                    variant="light"
                                    color="green"
                                    leftSection={<IconCheck size={14} />}
                                    style={{
                                        fontWeight: 600,
                                        textTransform: "none",
                                    }}
                                >
                                    Current: {farmName}
                                </Badge>
                            )}
                        </Stack>
                        {isOwner && (
                            <Button
                                size="sm"
                                variant="filled"
                                radius={6}
                                onClick={() => setCreateOpen(true)}
                                leftSection={<IconPlus size={16} />}
                            >
                                Create Farm
                            </Button>
                        )}
                    </Group>

                    {/* Search Input - Only show if there are farms */}
                    {farms.length > 3 && (
                        <BaseInput
                            placeholder="Search farms by name..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            styles={{
                                input: {
                                    height: "42px",
                                    minHeight: "42px",
                                    border: "1px solid var(--mantine-color-gray-3)",
                                },
                            }}
                        />
                    )}

                    {/* Farms List */}
                    <ScrollArea h={300} type="scroll">
                        {isLoading ? (
                            <Center py="xl">
                                <Stack gap="md" align="center">
                                    <Loader size="md" color="green" />
                                    <Text size="sm" c="dimmed">
                                        Loading your farms...
                                    </Text>
                                </Stack>
                            </Center>
                        ) : filteredFarms.length === 0 ? (
                            <Center py="xl">
                                <Stack gap="md" align="center">
                                    <IconBuilding size={48} color="var(--mantine-color-gray-4)" stroke={1.5} />
                                    <Text size="sm" c="dimmed" ta="center">
                                        {searchQuery ? (
                                            <>
                                                No farms found matching "{searchQuery}"
                                                <br />
                                                <Text
                                                    component="span"
                                                    c="green"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    Clear search
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                No farms yet. Create your first farm to get started!
                                            </>
                                        )}
                                    </Text>
                                    {isOwner && !searchQuery && (
                                        <Button
                                            size="sm"
                                            variant="filled"
                                            radius={6}
                                            onClick={() => setCreateOpen(true)}
                                            leftSection={<IconPlus size={16} />}
                                        >
                                            Create Your First Farm
                                        </Button>
                                    )}
                                </Stack>
                            </Center>
                        ) : (
                            <Stack gap="xs">
                                {filteredFarms.map((f) => {
                                    const id = f.id ?? f.farmId ?? "";
                                    const label = f.farmName ?? f.name ?? id;
                                    const isActive = farmId && id && farmId === id;
                                    return (
                                        <Paper
                                            key={id}
                                            withBorder
                                            radius="md"
                                            p="sm"
                                            style={{
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                borderColor: isActive
                                                    ? "var(--mantine-color-green-4)"
                                                    : "var(--mantine-color-gray-3)",
                                                backgroundColor: isActive
                                                    ? "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)"
                                                    : "var(--mantine-color-white)",
                                                borderWidth: isActive ? "2px" : "1px",
                                                boxShadow: isActive
                                                    ? "0 2px 8px rgba(22, 163, 74, 0.15)"
                                                    : "0 1px 3px rgba(0, 0, 0, 0.05)",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.transform = "translateY(-1px)";
                                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                                                    e.currentTarget.style.borderColor = "var(--mantine-color-gray-4)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.transform = "translateY(0)";
                                                    e.currentTarget.style.boxShadow = isActive
                                                        ? "0 2px 8px rgba(22, 163, 74, 0.15)"
                                                        : "0 1px 3px rgba(0, 0, 0, 0.05)";
                                                    e.currentTarget.style.borderColor = isActive
                                                        ? "var(--mantine-color-green-4)"
                                                        : "var(--mantine-color-gray-3)";
                                                }
                                            }}
                                            onClick={() => selectFarm(f)}
                                        >
                                            <Group justify="space-between" align="center" wrap="nowrap">
                                                <Group gap="md" align="center" style={{ flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            background: isActive
                                                                ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                                                                : "var(--mantine-color-gray-1)",
                                                            borderRadius: "8px",
                                                            padding: "8px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <IconBuilding
                                                            size={20}
                                                            color={isActive ? "white" : "var(--mantine-color-gray-6)"}
                                                        />
                                                    </div>
                                                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                                        <Text
                                                            fw={isActive ? 700 : 600}
                                                            size="sm"
                                                            c={isActive ? "green.7" : "dark"}
                                                            style={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {label}
                                                        </Text>
                                                        {isActive && (
                                                            <Badge
                                                                size="xs"
                                                                variant="light"
                                                                color="green"
                                                                style={{
                                                                    width: "fit-content",
                                                                    fontWeight: 600,
                                                                    textTransform: "none",
                                                                }}
                                                            >
                                                                Currently Active
                                                            </Badge>
                                                        )}
                                                    </Stack>
                                                </Group>
                                                {isActive && (
                                                    <ActionIcon
                                                        variant="filled"
                                                        color="green"
                                                        size="lg"
                                                        radius="md"
                                                        style={{
                                                            flexShrink: 0,
                                                            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                                            boxShadow: "0 2px 4px rgba(34, 197, 94, 0.3)",
                                                        }}
                                                    >
                                                        <IconCheck size={18} strokeWidth={3} />
                                                    </ActionIcon>
                                                )}
                                            </Group>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </ScrollArea>

                    {/* Footer Info */}
                    {farms.length > 10 && !searchQuery && (
                        <Text size="xs" c="dimmed" ta="center">
                            💡 Tip: Use the search bar above to quickly find your farm
                        </Text>
                    )}
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
