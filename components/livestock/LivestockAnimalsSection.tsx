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
import { useForm } from "@mantine/form";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import type { AnimalRecord, FilterValues } from "./types";
import { useAnimals } from "./hooks";
import { AddAnimalModal, UpdateAnimalModal } from "./modals";
import {
    HealthRecordsDrawer,
    WeightRecordsDrawer,
    FeedRecordsDrawer,
} from "./drawers";
import {
    AnimalTable,
    AnimalFilters,
    LivestockDashboard,
    AnimalGroupsSection,
} from "./components";

export default function LivestockAnimalsSection() {
    const { farmId, permissions, role } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>("dashboard");

    // Permission checks
    const canList =
        hasPermission("LIVESTOCK", "LIST", permissions, role) ||
        hasPermission("LIVESTOCK", "READ", permissions, role);
    const canCreate = hasPermission("LIVESTOCK", "CREATE", permissions, role);
    const canUpdate = hasPermission("LIVESTOCK", "UPDATE", permissions, role);
    const canDelete = hasPermission("LIVESTOCK", "DELETE", permissions, role);

    // Hooks
    const {
        animals,
        isLoading,
        pagination,
        error: animalsError,
        fetchAnimals,
        createAnimal,
        updateAnimal,
        deleteAnimal,
        setPagination,
    } = useAnimals();

    // State for all animals (for groups section)
    const [allAnimals, setAllAnimals] = useState<AnimalRecord[]>([]);
    const [isLoadingAllAnimals, setIsLoadingAllAnimals] = useState(false);

    // Modal/Drawer states
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [healthRecordDrawerOpen, setHealthRecordDrawerOpen] = useState(false);
    const [weightRecordDrawerOpen, setWeightRecordDrawerOpen] = useState(false);
    const [feedRecordDrawerOpen, setFeedRecordDrawerOpen] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(
        null
    );
    const [animalForRecord, setAnimalForRecord] = useState<AnimalRecord | null>(
        null
    );
    const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Filter form
    const filterForm = useForm<FilterValues>({
        initialValues: {
            search: "",
            gender: "all",
            birthdateFrom: "",
            birthdateTo: "",
        },
    });

    // Load animals on mount and when farmId changes
    useEffect(() => {
        if (farmId && canList) {
            fetchAnimals(1);
        }
    }, [farmId, canList]);

    // Fetch all animals when groups tab is active
    useEffect(() => {
        if (activeTab === "groups" && farmId && canList) {
            setIsLoadingAllAnimals(true);
            // Fetch with current filters to get animals
            // Note: In production, you'd want a separate API endpoint to fetch all animals
            fetchAnimals(1, {}).finally(() => {
                setIsLoadingAllAnimals(false);
            });
        }
    }, [activeTab, farmId, canList]);

    // Update allAnimals when animals change (for groups section)
    useEffect(() => {
        if (animals.length > 0 && activeTab === "groups") {
            setAllAnimals(animals);
        }
    }, [animals, activeTab]);

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

    // Sync hook error with local error state
    useEffect(() => {
        if (animalsError) {
            setError(animalsError);
        }
    }, [animalsError]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchAnimals(1, {
            search: filterForm.values.search,
            gender: filterForm.values.gender,
            birthdateFrom: filterForm.values.birthdateFrom,
            birthdateTo: filterForm.values.birthdateTo,
        });
    };

    const handleClearFilters = () => {
        filterForm.reset();
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchAnimals(1, {
            search: "",
            gender: "all",
            birthdateFrom: "",
            birthdateTo: "",
        });
    };

    const handleAddAnimal = async (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await createAnimal(values);
            setSuccessMessage("Animal added successfully");
            setModalOpen(false);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to add animal"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (animal: AnimalRecord) => {
        if (!canUpdate) {
            setError("You don't have permission to update animals");
            return;
        }
        setError(null);
        setSelectedAnimal(animal);
        setUpdateModalOpen(true);
    };

    const handleUpdateAnimal = async (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => {
        if (!selectedAnimal) {
            setError("Animal ID is required");
            return;
        }
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await updateAnimal(selectedAnimal.id, values);
            setSuccessMessage("Animal updated successfully");
            setUpdateModalOpen(false);
            setSelectedAnimal(null);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update animal"
            );
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (animal: AnimalRecord) => {
        if (!canDelete) {
            setError("You don't have permission to delete animals");
            return;
        }
        setAnimalToDelete(animal);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!animalToDelete) {
            setError("Animal ID is required");
            return;
        }
        setIsDeleting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await deleteAnimal(animalToDelete.id);
            setSuccessMessage("Animal deleted successfully");
            setDeleteModalOpen(false);
            setAnimalToDelete(null);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to delete animal"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Stack gap="lg">
            <div>
                <Title order={2}>Livestock</Title>
                <Text c="dimmed" size="sm">
                    Manage animals across your farm.
                </Text>
            </div>

            <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value ?? "dashboard")}
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
                    <Tabs.Tab value="animals">Animals</Tabs.Tab>
                    <Tabs.Tab value="groups">Animal Groups</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {activeTab === "dashboard" && <LivestockDashboard />}

            {activeTab === "animals" && (
                <Stack gap="md">
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
                            <Title order={3}>Animals</Title>
                            <Text size="sm" c="dimmed">
                                View existing livestock records and add new
                                animals.
                            </Text>
                        </div>
                        {canCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setModalOpen(true)}
                            >
                                Add animal
                            </Button>
                        )}
                    </Group>

                    {canList && (
                        <AnimalFilters
                            form={filterForm}
                            onSearch={handleSearch}
                            onClear={handleClearFilters}
                            isLoading={isLoading}
                            onOpenFilters={() => {}}
                        />
                    )}

                    {canList ? (
                        <Paper withBorder p="md" radius="md">
                            <AnimalTable
                                animals={animals}
                                isLoading={isLoading}
                                canUpdate={canUpdate}
                                canDelete={canDelete}
                                onUpdate={handleUpdate}
                                onDelete={handleDeleteClick}
                                onOpenHealthRecords={(animal) => {
                                    setAnimalForRecord(animal);
                                    setHealthRecordDrawerOpen(true);
                                }}
                                onOpenWeightRecords={(animal) => {
                                    setAnimalForRecord(animal);
                                    setWeightRecordDrawerOpen(true);
                                }}
                                onOpenFeedRecords={(animal) => {
                                    setAnimalForRecord(animal);
                                    setFeedRecordDrawerOpen(true);
                                }}
                            />
                        </Paper>
                    ) : (
                        <Paper withBorder p="xl" radius="md">
                            <Text c="dimmed" ta="center">
                                You don't have permission to view the animal
                                listing.
                            </Text>
                        </Paper>
                    )}

                    {canList && pagination.totalPages > 1 && (
                        <Group justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                Showing {animals.length} of {pagination.total}{" "}
                                animals
                            </Text>
                            <Pagination
                                value={pagination.page}
                                onChange={(page) => {
                                    setPagination((prev) => ({
                                        ...prev,
                                        page,
                                    }));
                                    fetchAnimals(page, {
                                        search: filterForm.values.search,
                                        gender: filterForm.values.gender,
                                        birthdateFrom:
                                            filterForm.values.birthdateFrom,
                                        birthdateTo:
                                            filterForm.values.birthdateTo,
                                    });
                                }}
                                total={pagination.totalPages}
                                size="sm"
                            />
                        </Group>
                    )}
                </Stack>
            )}

            {activeTab === "groups" && (
                <AnimalGroupsSection
                    availableAnimals={allAnimals}
                    isLoadingAnimals={isLoadingAllAnimals}
                />
            )}

            <AddAnimalModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddAnimal}
                isSubmitting={isSubmitting}
            />

            <UpdateAnimalModal
                opened={updateModalOpen}
                onClose={() => {
                    setUpdateModalOpen(false);
                    setSelectedAnimal(null);
                }}
                onSubmit={handleUpdateAnimal}
                isSubmitting={isUpdating}
                animal={selectedAnimal}
            />

            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setAnimalToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Animal"
                itemName={animalToDelete?.name || ""}
                itemType="animal"
                isDeleting={isDeleting}
            />

            <HealthRecordsDrawer
                opened={healthRecordDrawerOpen}
                onClose={() => {
                    setHealthRecordDrawerOpen(false);
                    setAnimalForRecord(null);
                }}
                animal={animalForRecord}
            />

            <WeightRecordsDrawer
                opened={weightRecordDrawerOpen}
                onClose={() => {
                    setWeightRecordDrawerOpen(false);
                    setAnimalForRecord(null);
                }}
                animal={animalForRecord}
            />

            <FeedRecordsDrawer
                opened={feedRecordDrawerOpen}
                onClose={() => {
                    setFeedRecordDrawerOpen(false);
                    setAnimalForRecord(null);
                }}
                animal={animalForRecord}
            />
        </Stack>
    );
}
