"use client";

import React, { useState, useMemo, useEffect } from "react";
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
    useMantineTheme,
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
    const theme = useMantineTheme();
    const { farmId, setRoleAndFarm, role, setUserData, setPermissions, farmName } =
        useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [isApplying, setIsApplying] = useState(false);
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

    const selectFarm = async (f: Farm | null) => {
        if (!f) return;
        
        const nextId = f.id ?? f.farmId ?? null;
        if (!nextId) return;
        
        setIsApplying(true);
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
            // Refresh the page to reload all server components and update navigation tabs
            router.refresh();
            
            // Close modal after successful switch
            setSelectedFarm(null);
            setSearchQuery("");
            onClose();
        } catch (e) {
            // noop: you can add a toast here if desired
        } finally {
            setIsApplying(false);
        }
    };

    const handleApply = () => {
        if (selectedFarm) {
            selectFarm(selectedFarm);
        }
    };

    const handleCancel = () => {
        setSelectedFarm(null);
        setSearchQuery("");
        onClose();
    };

    useEffect(() => {
        if (opened) {
            setSelectedFarm(farms.find((f) => f.id === farmId) ?? null);
        }
    }, [farmId, farms, opened]);

    return (
        <>
            <Modal
                opened={opened}
                onClose={() => {
                    setSelectedFarm(null);
                    setSearchQuery("");
                    onClose();
                }}
                title={
                    <Group gap={8} align="center">
                        <IconBuilding size={20} color={theme.colors.brandGreen[6]} />
                        <Text fw={700} size="lg">Switch Farm</Text>
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
                    <Group justify="space-between" align="center">
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
                    <ScrollArea styles={{ scrollbar: { width: "8px" } }} h={300} type="scroll">
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
                                    const isSelected = selectedFarm && (selectedFarm.id ?? selectedFarm.farmId) === id;
                                    return (
                                        <Paper
                                            key={id}
                                            withBorder
                                            radius="md"
                                            p="sm"
                                            style={{
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                borderColor:  isSelected
                                                      ? theme.colors.brandGreen[5]
                                                      : theme.colors.gray[3],
                                                backgroundColor: isSelected
                                                      ? theme.colors.brandGreen[0]
                                                      : theme.white,
                                                borderWidth: (isSelected) ? "2px" : "1px",
                                                boxShadow: isSelected
                                                      ? `0 2px 8px ${theme.colors.brandGreen[2]}`
                                                      : "0 1px 3px rgba(0, 0, 0, 0.05)",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                                                    e.currentTarget.style.borderColor = theme.colors.gray[4];
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                                                    e.currentTarget.style.borderColor = theme.colors.gray[3];
                                                }
                                            }}
                                            onClick={() => {
                                                    setSelectedFarm(f);
                                            }}
                                        >
                                            <Group justify="space-between" align="center" wrap="nowrap">
                                                <Group gap="md" align="center" style={{ flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            background: isSelected
                                                                ? theme.colors.brandGreen[6]
                                                                : theme.colors.gray[1],
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
                                                            color={ isSelected ? "white" : theme.colors.gray[6]}
                                                        />
                                                    </div>
                                                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                                        <Text
                                                            fw={( isSelected) ? 700 : 600}
                                                            size="sm"
                                                            c={ isSelected ? "brandGreen.7" : "dark"}
                                                            style={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {label}
                                                        </Text>
                                                        
                                                    </Stack>
                                                </Group>
                                                {( isSelected) && (
                                                    <ActionIcon
                                                        variant="filled"
                                                        color="brandGreen"
                                                        size="sm"
                                                        radius="md"
                                                        style={{
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <IconCheck size={14} strokeWidth={3} />
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

                    {/* Footer Actions */}
                    <Group justify="end" align="center">
                        <Button
                            size="sm"
                            variant="outline"
                            radius={6}
                            onClick={handleCancel}
                            disabled={isApplying}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="filled"
                            radius={6}
                            onClick={handleApply}
                            disabled={!selectedFarm || isApplying || Boolean(selectedFarm && farmId && (selectedFarm.id ?? selectedFarm.farmId) === farmId)}
                            loading={isApplying}
                        >
                            Apply
                        </Button>
                    </Group>
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
