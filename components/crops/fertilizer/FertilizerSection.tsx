"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type {
  FertilizerRecord,
  FilterValues,
  AddFertilizerValues,
} from "./types";
import { useFertilizer } from "./hooks";
import { AddFertilizerModal, UpdateFertilizerModal } from "./modals";
import {
  FertilizerTable,
  FertilizerFilters,
  FertilizerFiltersDrawer,
} from "./components";
import type { CreateFertilizerData } from "./types";

export default function FertilizerSection() {
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
    fertilizers,
    isLoading,
    pagination,
    error: fertilizerError,
    fetchFertilizers,
    createFertilizer,
    updateFertilizer,
    deleteFertilizer,
    setPagination,
  } = useFertilizer();

  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] =
    useState<FertilizerRecord | null>(null);
  const [fertilizerToDelete, setFertilizerToDelete] =
    useState<FertilizerRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Toast, showToast } = useToast();

  // Filter form
  const filterForm = useForm<FilterValues>({
    initialValues: {
      search: "",
      fieldId: "all",
      applicationDateFrom: "",
      applicationDateTo: "",
    },
  });

  // Load fertilizers on mount and when farmId changes
  useEffect(() => {
    if (farmId && canList) {
      fetchFertilizers(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, canList]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (fertilizerError) {
      showToast(fertilizerError, "red");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fertilizerError]);

  // Debounce search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search change with debounce
  const handleSearchChange = (searchValue: string) => {
    filterForm.setFieldValue("search", searchValue);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced filter
    searchTimeoutRef.current = setTimeout(() => {
      const currentFilters = filterForm.values;
      fetchFertilizers(1, {
        search: searchValue || undefined,
        fieldId:
          currentFilters.fieldId !== "all" ? currentFilters.fieldId : undefined,
        applicationDateFrom: currentFilters.applicationDateFrom || undefined,
        applicationDateTo: currentFilters.applicationDateTo || undefined,
      });
    }, 300);
  };

  // Handle filter changes from drawer
  const handleApplyFilters = (newFilters: FilterValues) => {
    filterForm.setValues(newFilters);
    fetchFertilizers(1, {
      search: newFilters.search || undefined,
      fieldId: newFilters.fieldId !== "all" ? newFilters.fieldId : undefined,
      applicationDateFrom: newFilters.applicationDateFrom || undefined,
      applicationDateTo: newFilters.applicationDateTo || undefined,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    filterForm.setValues({
      search: "",
      fieldId: "all",
      applicationDateFrom: "",
      applicationDateTo: "",
    });
    fetchFertilizers(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchFertilizers(page, {
      search: filterForm.values.search || undefined,
      fieldId:
        filterForm.values.fieldId !== "all"
          ? filterForm.values.fieldId
          : undefined,
      applicationDateFrom: filterForm.values.applicationDateFrom || undefined,
      applicationDateTo: filterForm.values.applicationDateTo || undefined,
    });
  };

  // Handle create
  const handleCreate = async (values: AddFertilizerValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const createData: CreateFertilizerData = {
        fieldId: values.fieldId,
        applicationDate: values.applicationDate,
        fertilizerType: values.fertilizerType || "",
        quantity: values.quantity || "",
        quantityUnit: values.quantityUnit || "",
        applicationMethod: values.applicationMethod,
        cost: values.cost || "",
        notes: values.notes,
      };
      const success = await createFertilizer(createData);
      if (success) {
        showToast("Fertilizer record created successfully", "green");
        setModalOpen(false);
      } else {
        showToast("Failed to create fertilizer record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create fertilizer record";
      setError(errorMessage);
      showToast(errorMessage, "red");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async (values: AddFertilizerValues) => {
    if (!selectedFertilizer) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updateData: CreateFertilizerData = {
        fieldId: values.fieldId,
        applicationDate: values.applicationDate,
        fertilizerType: values.fertilizerType || "",
        quantity: values.quantity || "",
        quantityUnit: values.quantityUnit || "",
        applicationMethod: values.applicationMethod,
        cost: values.cost || "",
        notes: values.notes,
      };
      const success = await updateFertilizer(selectedFertilizer.id, updateData);
      if (success) {
        showToast("Fertilizer record updated successfully", "green");
        setUpdateModalOpen(false);
        setSelectedFertilizer(null);
      } else {
        showToast("Failed to update fertilizer record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update fertilizer record";
      setError(errorMessage);
      showToast(errorMessage, "red");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!fertilizerToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const success = await deleteFertilizer(fertilizerToDelete.id);
      if (success) {
        showToast("Fertilizer record deleted successfully", "green");
        setDeleteModalOpen(false);
        setFertilizerToDelete(null);
      } else {
        showToast("Failed to delete fertilizer record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to delete fertilizer record";
      setError(errorMessage);
      showToast(errorMessage, "red");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canList) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Text c="dimmed" ta="center">
          You don't have permission to view fertilizer records.
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
        overflow: "hidden",
      }}
    >
      {/* Toast */}
      <div style={{ flexShrink: 0 }}>
        <Toast />
      </div>
      <Stack
        gap="lg"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        {/* Header */}
        <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
          <div>
            <Title order={2}>Fertilizer</Title>
            <Text c="dimmed" size="sm">
              Track and manage fertilizer applications across your fields.
            </Text>
          </div>
          {canCreate && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Fertilizer
            </Button>
          )}
        </Group>

        {/* Search and Filters */}
        <Group
          gap="md"
          align="stretch"
          justify="space-between"
          wrap="nowrap"
          style={{ flexShrink: 0 }}
        >
          <BaseInput
            placeholder="Search by field name, type, method, or notes"
            leftSection={<IconSearch size={16} />}
            style={{
              width: "100%",
              maxWidth: 500,
              flex: "1 1 0",
              minWidth: 0,
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
                // Clear timeout and search immediately on Enter
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                const currentFilters = filterForm.values;
                fetchFertilizers(1, {
                  search: currentFilters.search || undefined,
                  fieldId:
                    currentFilters.fieldId !== "all"
                      ? currentFilters.fieldId
                      : undefined,
                  applicationDateFrom:
                    currentFilters.applicationDateFrom || undefined,
                  applicationDateTo:
                    currentFilters.applicationDateTo || undefined,
                });
              }
            }}
          />
          <FertilizerFilters onOpenFilters={() => setFiltersDrawerOpen(true)} />
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
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              flex: "1 1 0",
              minHeight: 0,
              maxHeight: "100%",
              overflow: "auto",
            }}
          >
            <FertilizerTable
              fertilizers={fertilizers}
              pagination={pagination}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onUpdate={(fertilizer) => {
                setSelectedFertilizer(fertilizer);
                setUpdateModalOpen(true);
              }}
              onDelete={(fertilizer) => {
                setFertilizerToDelete(fertilizer);
                setDeleteModalOpen(true);
              }}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Modals */}
        <AddFertilizerModal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setError(null);
          }}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />

        <UpdateFertilizerModal
          opened={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedFertilizer(null);
            setError(null);
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          fertilizer={selectedFertilizer}
        />

        <DeleteConfirmationModal
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setFertilizerToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Fertilizer Record"
          message={
            fertilizerToDelete
              ? `Are you sure you want to delete the fertilizer record for ${fertilizerToDelete.fieldName || "this field"}? This action cannot be undone.`
              : "Are you sure you want to delete this fertilizer record? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />

        <FertilizerFiltersDrawer
          opened={filtersDrawerOpen}
          onClose={() => setFiltersDrawerOpen(false)}
          filters={filterForm.values}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </Stack>
    </Paper>
  );
}
