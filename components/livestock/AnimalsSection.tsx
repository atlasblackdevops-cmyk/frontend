"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type { AnimalRecord, FilterValues } from "./types";
import { useAnimals } from "./hooks";
import { AddAnimalModal, UpdateAnimalModal } from "./modals";
import {
  HealthRecordsDrawer,
  WeightRecordsDrawer,
  FeedRecordsDrawer,
  AnimalFiltersDrawer,
} from "./drawers";
import { AnimalTable, AnimalFilters } from "./components";

export default function AnimalsSection() {
  const { farmId, permissions, role } = useAuth();

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

  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [healthRecordDrawerOpen, setHealthRecordDrawerOpen] = useState(false);
  const [weightRecordDrawerOpen, setWeightRecordDrawerOpen] = useState(false);
  const [feedRecordDrawerOpen, setFeedRecordDrawerOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(null);
  const [animalForRecord, setAnimalForRecord] = useState<AnimalRecord | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(null);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Toast, showToast } = useToast();

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

  // Surface fetch errors as toast
  useEffect(() => {
    if (animalsError) {
      showToast(animalsError, "red");
    }
  }, [animalsError]);

  // Calculate active filters count (excluding search)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterForm.values.gender !== "all") count++;
    if (filterForm.values.birthdateFrom) count++;
    if (filterForm.values.birthdateTo) count++;
    return count;
  };

  // Handle search change
  const handleSearchChange = (searchValue: string) => {
    filterForm.setFieldValue("search", searchValue);
    fetchAnimals(1, {
      search: searchValue || undefined,
      gender: filterForm.values.gender !== "all" ? filterForm.values.gender : undefined,
      birthdateFrom: filterForm.values.birthdateFrom || undefined,
      birthdateTo: filterForm.values.birthdateTo || undefined,
    });
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: FilterValues) => {
    filterForm.setValues(newFilters);
    fetchAnimals(1, {
      search: newFilters.search || undefined,
      gender: newFilters.gender !== "all" ? newFilters.gender : undefined,
      birthdateFrom: newFilters.birthdateFrom || undefined,
      birthdateTo: newFilters.birthdateTo || undefined,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      search: filterForm.values.search, // Keep search
      gender: "all",
      birthdateFrom: "",
      birthdateTo: "",
    };
    filterForm.setValues(clearedFilters);
    fetchAnimals(1, {
      search: clearedFilters.search || undefined,
      gender: undefined,
      birthdateFrom: undefined,
      birthdateTo: undefined,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    fetchAnimals(page, {
      search: filterForm.values.search || undefined,
      gender: filterForm.values.gender !== "all" ? filterForm.values.gender : undefined,
      birthdateFrom: filterForm.values.birthdateFrom || undefined,
      birthdateTo: filterForm.values.birthdateTo || undefined,
    });
  };

  // Handle add animal
  const handleAddAnimal = async (values: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createAnimal(values);
      showToast("Animal added successfully!", "green");
      setModalOpen(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to add animal"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to add animal",
        "red"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update animal
  const handleUpdateAnimal = async (values: any) => {
    if (!selectedAnimal) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateAnimal(selectedAnimal.id, values);
      showToast("Animal updated successfully!", "green");
      setUpdateModalOpen(false);
      setSelectedAnimal(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update animal"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to update animal",
        "red"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete animal
  const handleDeleteAnimal = async () => {
    if (!animalToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAnimal(animalToDelete.id);
      showToast("Animal deleted successfully!", "green");
      setDeleteModalOpen(false);
      setAnimalToDelete(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to delete animal"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to delete animal",
        "red"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canList) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Text c="dimmed" ta="center">
          You don't have permission to view animals.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper 
      p={26} 
      radius="none" 
      withBorder={false} 
      style={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
        {/* Header */}
        <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
          <div>
            <Title order={2}>Animals</Title>
            <Text c="dimmed" size="sm">
              Manage your livestock animals and their records
            </Text>
          </div>
          {canCreate && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Animal
            </Button>
          )}
        </Group>

        {/* Toast */}
        <div style={{ flexShrink: 0 }}>
          <Toast />
        </div>

        {/* Search and Filters */}
        <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
          <BaseInput
            placeholder="Search by animal name"
            leftSection={<IconSearch size={16} />}
            style={{ 
              width: "100%",
              maxWidth: 500,
              flex: "1 1 0",
              minWidth: 0
            }}
            styles={{
              input: {
                height: "42px",
                minHeight: "42px",
              },
            }}
            value={filterForm.values.search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchChange(filterForm.values.search);
              }
            }}
          />
          <AnimalFilters 
            onOpenFilters={() => setFiltersDrawerOpen(true)}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </Group>

        {/* Table - Scrollable container */}
        <div 
          style={{ 
            flex: "1 1 0",
            minHeight: 0,
            width: "100%",
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <div style={{ 
            width: "100%",
            flex: "1 1 0",
            minHeight: 0,
            maxHeight: "100%",
            overflow: "auto"
          }}>
            <AnimalTable
              animals={animals}
              pagination={pagination}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onUpdate={(animal) => {
                setSelectedAnimal(animal);
                setUpdateModalOpen(true);
              }}
              onDelete={(animal) => {
                setAnimalToDelete(animal);
                setDeleteModalOpen(true);
              }}
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
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Stack>

      {/* Modals */}
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
        onConfirm={() => {
          void handleDeleteAnimal();
        }}
        title="Delete Animal"
        subtitle={`Are you sure you want to delete "${animalToDelete?.name || "this animal"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDeleting={isDeleting}
      />

      {/* Drawers */}
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

      {/* Filters Drawer */}
      <AnimalFiltersDrawer
        opened={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filterForm.values}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </Paper>
  );
}

