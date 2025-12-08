"use client";

import { useState, useEffect } from "react";
import { Button, Group, Paper, Pagination, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import type { PlantingRecord, FilterValues, CreatePlantingData } from "../types";
import { usePlantings } from "../hooks";
import { PlantingModal } from "../modals";
import { PlantingTable, PlantingFilters, PlantingFiltersDrawer } from "../components";

export default function PlantingSection() {
    const { farmId, permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("CROPS", "LIST", permissions, role) ||
        hasPermission("CROPS", "READ", permissions, role);
    const canCreate = hasPermission("CROPS", "CREATE", permissions, role);
    const canUpdate = hasPermission("CROPS", "UPDATE", permissions, role);
    const canDelete = hasPermission("CROPS", "DELETE", permissions, role);

    // Hooks
    const {
        plantings,
        isLoading,
        pagination,
        error: plantingsError,
        fetchPlantings,
        createPlanting,
        updatePlanting,
        deletePlanting,
        setPagination,
    } = usePlantings();

    // Modal/Drawer states
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [plantingToUpdate, setPlantingToUpdate] = useState<PlantingRecord | null>(null);
    const [plantingToDelete, setPlantingToDelete] = useState<PlantingRecord | null>(null);

    // Messages
    const [error, setError] = useState<string | null>(null);
    const { Toast, showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Search and filters
    const filterForm = useForm<FilterValues>({
        initialValues: {
            search: "",
            crop: "",
            fieldId: "",
            plantingDateFrom: "",
            plantingDateTo: "",
        },
    });

    // Fetch plantings on mount and when filters change
    useEffect(() => {
        if (farmId && canList) {
            void fetchPlantings(pagination.page, {
                search: filterForm.values.search || undefined,
                crop: filterForm.values.crop || undefined,
                fieldId: filterForm.values.fieldId || undefined,
                plantingDateFrom: filterForm.values.plantingDateFrom || undefined,
                plantingDateTo: filterForm.values.plantingDateTo || undefined,
            });
        }
    }, [
        farmId,
        canList,
        filterForm.values.search,
        filterForm.values.crop,
        filterForm.values.fieldId,
        filterForm.values.plantingDateFrom,
        filterForm.values.plantingDateTo,
        pagination.page,
        pagination.limit,
    ]);

    // Handle errors from hooks
    useEffect(() => {
        if (plantingsError) {
            setError(plantingsError);
            showToast(plantingsError, "red");
        }
    }, [plantingsError]);

    // Handle create planting
    const handleCreatePlanting = async (values: unknown) => {
        if (!farmId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const success = await createPlanting(values as CreatePlantingData);

            if (success) {
                setModalOpen(false);
                showToast("Planting record created successfully", "green");
                void fetchPlantings(pagination.page, {
                    search: filterForm.values.search || undefined,
                    crop: filterForm.values.crop || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    plantingDateFrom: filterForm.values.plantingDateFrom || undefined,
                    plantingDateTo: filterForm.values.plantingDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create planting record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update planting
    const handleUpdatePlanting = async (values: unknown) => {
        if (!plantingToUpdate || !farmId) return;

        setIsUpdating(true);
        setError(null);

        try {
            const success = await updatePlanting(plantingToUpdate.id, values as CreatePlantingData);

            if (success) {
                setUpdateModalOpen(false);
                setPlantingToUpdate(null);
                showToast("Planting record updated successfully", "green");
                void fetchPlantings(pagination.page, {
                    search: filterForm.values.search || undefined,
                    crop: filterForm.values.crop || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    plantingDateFrom: filterForm.values.plantingDateFrom || undefined,
                    plantingDateTo: filterForm.values.plantingDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update planting record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete planting
    const handleDeletePlanting = async () => {
        if (!plantingToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const success = await deletePlanting(plantingToDelete.id);

            if (success) {
                setDeleteModalOpen(false);
                setPlantingToDelete(null);
                showToast("Planting record deleted successfully", "green");
                void fetchPlantings(pagination.page, {
                    search: filterForm.values.search || undefined,
                    crop: filterForm.values.crop || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    plantingDateFrom: filterForm.values.plantingDateFrom || undefined,
                    plantingDateTo: filterForm.values.plantingDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete planting record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle search change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        filterForm.setFieldValue("search", event.target.value);
    };

    // Handle filter apply
    const handleApplyFilters = (newFilters: FilterValues) => {
        filterForm.setValues(newFilters);
        setFiltersDrawerOpen(false);
        // Filters are applied via useEffect when filterForm.values change
    };

    // Handle clear filters
    const handleClearFilters = () => {
        filterForm.reset();
        setFiltersDrawerOpen(false);
    };

    // Handle edit click
    const handleEditClick = (planting: PlantingRecord) => {
        setPlantingToUpdate(planting);
        setUpdateModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (planting: PlantingRecord) => {
        setPlantingToDelete(planting);
        setDeleteModalOpen(true);
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">You don't have permission to view planting records.</Text>
            </Paper>
        );
    }

    return (
        <Stack gap="lg">
            {/* Header */}
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Planting Records</Title>
                    <Text c="dimmed" size="sm">
                        Manage planting records and track currently planted crops per field
                    </Text>
                </div>

                {canCreate && (
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Planting
                    </Button>
                )}
            </Group>

            <Toast />

            {/* Filters */}
            <Group align="stretch" gap="md">
                <TextInput
                    placeholder="Search by crop name, seed type..."
                    leftSection={<IconSearch size={16} />}
                    value={filterForm.values.search}
                    onChange={handleSearchChange}
                    style={{ flex: 1 }}
                />
                <div style={{ display: "flex", alignItems: "stretch" }}>
                    <PlantingFilters
                        onOpenFilters={() => setFiltersDrawerOpen(true)}
                    />
                </div>
            </Group>

            {/* Table */}
            <PlantingTable
                plantings={plantings}
                isLoading={isLoading}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onUpdate={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Group justify="center">
                    <Pagination
                        value={pagination.page}
                        onChange={(page) => setPagination({ ...pagination, page })}
                        total={pagination.totalPages}
                    />
                </Group>
            )}

            {/* Modals */}
            {canCreate && (
                <PlantingModal
                    mode="create"
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreatePlanting}
                    isSubmitting={isSubmitting}
                />
            )}

            {canUpdate && plantingToUpdate && (
                <PlantingModal
                    mode="update"
                    planting={plantingToUpdate}
                    opened={updateModalOpen}
                    onClose={() => {
                        setUpdateModalOpen(false);
                        setPlantingToUpdate(null);
                    }}
                    onSubmit={handleUpdatePlanting}
                    isSubmitting={isUpdating}
                />
            )}

            {/* Filters Drawer */}
            <PlantingFiltersDrawer
                opened={filtersDrawerOpen}
                onClose={() => setFiltersDrawerOpen(false)}
                filters={filterForm.values}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPlantingToDelete(null);
                }}
                onConfirm={handleDeletePlanting}
                title="Delete Planting Record"
                message={`Are you sure you want to delete the planting record for "${plantingToDelete?.crop}"? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={plantingToDelete?.crop || ""}
                itemType="planting record"
            />
        </Stack>
    );
}

