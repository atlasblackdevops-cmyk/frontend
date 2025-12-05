"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Group,
    Notification,
    Paper,
    Pagination,
    Stack,
    Tabs,
    Text,
    Title,
} from "@mantine/core";
import { IconPlus, IconX, IconUsersGroup } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import type {
    AnimalGroup,
    AddGroupValues,
    AssignAnimalsValues,
    AnimalRecord,
    GroupMetrics,
    UpdateGroupValues,
} from "../types";
import {
    getGroupsDashboard,
    getGroups,
    getGroupDetails,
    createGroup,
    updateGroup,
    assignAnimalsToGroup,
    removeAnimalsFromGroup,
    deleteGroup,
} from "@/lib/livestock/api";
import GroupDashboard from "./GroupDashboard";
import GroupsTable from "./GroupsTable";
import AddGroupModal from "../modals/AddGroupModal";
import UpdateGroupModal from "../modals/UpdateGroupModal";
import AssignAnimalsModal from "../modals/AssignAnimalsModal";

// Initial empty state
const initialMetrics: GroupMetrics = {
    totalGroups: 0,
    animalsInGroups: 0,
    averageGroupSize: 0,
    averageWeight: null,
    averageAge: null,
    groupDistribution: 0,
};

interface AnimalGroupsSectionProps {
    availableAnimals: AnimalRecord[];
    isLoadingAnimals: boolean;
}

export default function AnimalGroupsSection({
    availableAnimals,
    isLoadingAnimals,
}: AnimalGroupsSectionProps) {
    const { permissions, role } = useAuth();
    const [activeView, setActiveView] = useState<string | null>("dashboard");

    // Permission checks
    const canList =
        hasPermission("LIVESTOCK", "LIST", permissions, role) ||
        hasPermission("LIVESTOCK", "READ", permissions, role);
    const canCreate = hasPermission("LIVESTOCK", "CREATE", permissions, role);
    const canUpdate = hasPermission("LIVESTOCK", "UPDATE", permissions, role);
    const canDelete = hasPermission("LIVESTOCK", "DELETE", permissions, role);

    // State management
    const [groups, setGroups] = useState<AnimalGroup[]>([]);
    const [metrics, setMetrics] = useState<GroupMetrics>(initialMetrics);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<AnimalGroup | null>(
        null
    );
    const [groupToDelete, setGroupToDelete] = useState<AnimalGroup | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Clear notifications after 5 seconds
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    // Fetch groups dashboard metrics
    const fetchGroupsMetrics = async () => {
        setIsLoadingMetrics(true);
        setError(null);
        try {
            const metricsData = await getGroupsDashboard();
            setMetrics(metricsData);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch groups metrics"
            );
        } finally {
            setIsLoadingMetrics(false);
        }
    };

    // Fetch groups list
    const fetchGroups = async (page: number = 1, search?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getGroups({
                page,
                limit: pagination.limit,
                search: search || undefined,
            });

            const responseData = response.data ?? response;
            const groupsData = responseData?.groups ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            setGroups(groupsData);
            setPagination(paginationData);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch groups"
            );
            setGroups([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (canList) {
            fetchGroupsMetrics();
            fetchGroups(1);
        }
    }, [canList]);

    const handleCreateGroup = async (values: AddGroupValues) => {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await createGroup(values);
            setSuccessMessage("Group created successfully");
            await fetchGroupsMetrics();
            await fetchGroups(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to create group"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignAnimals = async (group: AnimalGroup) => {
        setSelectedGroup(group);
        setAssignModalOpen(true);
    };

    const handleAssignAnimalsSubmit = async (values: AssignAnimalsValues) => {
        if (!selectedGroup) {
            setError("Group is required");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // Get currently assigned animal IDs
            const currentIds = currentGroupAnimalIds;
            const newIds = values.animalIds;

            // Find animals to add and remove
            const animalsToAdd = newIds.filter(
                (id) => !currentIds.includes(id)
            );
            const animalsToRemove = currentIds.filter(
                (id) => !newIds.includes(id)
            );

            // If there are animals to remove, use removeAnimalsFromGroup API
            if (animalsToRemove.length > 0) {
                await removeAnimalsFromGroup(selectedGroup.id, animalsToRemove);
            }

            // If there are animals to add, use assignAnimalsToGroup API
            if (animalsToAdd.length > 0) {
                const result = await assignAnimalsToGroup(
                    selectedGroup.id,
                    animalsToAdd
                );
                setSuccessMessage(
                    `${result.assigned} animals added${animalsToRemove.length > 0 ? `, ${animalsToRemove.length} animals removed` : ""}.`
                );
            } else if (animalsToRemove.length > 0) {
                setSuccessMessage(
                    `${animalsToRemove.length} animals removed successfully.`
                );
            } else {
                setSuccessMessage("No changes made.");
            }

            setAssignModalOpen(false);
            setSelectedGroup(null);
            setCurrentGroupAnimalIds([]);
            await fetchGroupsMetrics();
            await fetchGroups(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update animals in group"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (group: AnimalGroup) => {
        if (!canUpdate) {
            setError("You don't have permission to update groups");
            return;
        }
        setSelectedGroup(group);
        setUpdateModalOpen(true);
    };

    const handleUpdateGroup = async (values: UpdateGroupValues) => {
        if (!selectedGroup) {
            setError("Group is required");
            return;
        }
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await updateGroup(selectedGroup.id, values);
            setSuccessMessage("Group updated successfully");
            setUpdateModalOpen(false);
            setSelectedGroup(null);
            await fetchGroupsMetrics();
            await fetchGroups(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update group"
            );
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (group: AnimalGroup) => {
        if (!canDelete) {
            setError("You don't have permission to delete groups");
            return;
        }
        setGroupToDelete(group);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!groupToDelete) {
            setError("Group ID is required");
            return;
        }
        setIsDeleting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await deleteGroup(groupToDelete.id);
            setSuccessMessage("Group deleted successfully");
            setDeleteModalOpen(false);
            setGroupToDelete(null);
            await fetchGroupsMetrics();
            await fetchGroups(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to delete group"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const getCurrentGroupAnimalIds = async (): Promise<string[]> => {
        if (!selectedGroup) return [];
        try {
            const groupDetails = await getGroupDetails(selectedGroup.id);
            return (
                groupDetails.animals?.map(
                    (assignment) => assignment.animal.id
                ) ?? []
            );
        } catch (err) {
            console.error("Failed to fetch group animal IDs:", err);
            return [];
        }
    };

    // State for current group animal IDs
    const [currentGroupAnimalIds, setCurrentGroupAnimalIds] = useState<
        string[]
    >([]);

    // Fetch animal IDs when assign modal opens
    useEffect(() => {
        if (assignModalOpen && selectedGroup) {
            getCurrentGroupAnimalIds().then((ids) => {
                setCurrentGroupAnimalIds(ids);
            });
        }
    }, [assignModalOpen, selectedGroup]);

    return (
        <Stack gap="lg">
            {error && (
                <Notification
                    icon={<IconX size={18} />}
                    color="red"
                    title="Error"
                    onClose={() => setError(null)}
                    withCloseButton
                >
                    {error}
                </Notification>
            )}

            {successMessage && (
                <Notification
                    color="green"
                    title="Success"
                    onClose={() => setSuccessMessage(null)}
                    withCloseButton
                >
                    {successMessage}
                </Notification>
            )}

            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Animal Groups</Title>
                    <Text size="sm" c="dimmed">
                        Organize animals into groups for better management and
                        tracking.
                    </Text>
                </div>
                {canCreate && (
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setAddModalOpen(true)}
                    >
                        Create Group
                    </Button>
                )}
            </Group>

            <Tabs
                value={activeView}
                onChange={(value) => setActiveView(value ?? "dashboard")}
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="dashboard"
                        leftSection={<IconUsersGroup size={16} />}
                    >
                        Dashboard
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="groups"
                        leftSection={<IconUsersGroup size={16} />}
                    >
                        Groups
                    </Tabs.Tab>
                </Tabs.List>

                {activeView === "dashboard" && (
                    <Paper withBorder p="md" radius="md" mt="md">
                        <GroupDashboard
                            metrics={metrics}
                            isLoading={isLoadingMetrics}
                            error={error}
                        />
                    </Paper>
                )}

                {activeView === "groups" && (
                    <Stack gap="md" mt="md">
                        {canList ? (
                            <Paper withBorder p="md" radius="md">
                                <GroupsTable
                                    groups={groups}
                                    isLoading={isLoading}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDeleteClick}
                                    onAssignAnimals={handleAssignAnimals}
                                />
                            </Paper>
                        ) : (
                            <Paper withBorder p="xl" radius="md">
                                <Text c="dimmed" ta="center">
                                    You don't have permission to view groups.
                                </Text>
                            </Paper>
                        )}
                    </Stack>
                )}
            </Tabs>

            <AddGroupModal
                opened={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSubmit={handleCreateGroup}
                isSubmitting={isSubmitting}
            />

            <UpdateGroupModal
                opened={updateModalOpen}
                onClose={() => {
                    setUpdateModalOpen(false);
                    setSelectedGroup(null);
                }}
                onSubmit={handleUpdateGroup}
                isSubmitting={isUpdating}
                group={selectedGroup}
            />

            <AssignAnimalsModal
                opened={assignModalOpen}
                onClose={() => {
                    setAssignModalOpen(false);
                    setSelectedGroup(null);
                    setCurrentGroupAnimalIds([]);
                }}
                onSubmit={handleAssignAnimalsSubmit}
                isSubmitting={isSubmitting}
                availableAnimals={availableAnimals}
                currentAnimalIds={currentGroupAnimalIds}
                isLoadingAnimals={isLoadingAnimals}
            />

            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setGroupToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Group"
                itemName={groupToDelete?.name || ""}
                itemType="group"
                isDeleting={isDeleting}
            />
        </Stack>
    );
}
