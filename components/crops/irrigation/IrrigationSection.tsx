"use client";

import { useState, useEffect, useRef } from "react";
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
import type { IrrigationRecord, FilterValues } from "./types";
import { useIrrigation } from "./hooks";
import { AddIrrigationModal, UpdateIrrigationModal } from "./modals";
import { IrrigationTable, IrrigationFilters, IrrigationFiltersDrawer } from "./components";

export default function IrrigationSection() {
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
    irrigations,
    isLoading,
    pagination,
    error: irrigationError,
    fetchIrrigations,
    createIrrigation,
    updateIrrigation,
    deleteIrrigation,
    setPagination,
  } = useIrrigation();

  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [selectedIrrigation, setSelectedIrrigation] = useState<IrrigationRecord | null>(null);
  const [irrigationToDelete, setIrrigationToDelete] = useState<IrrigationRecord | null>(null);
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
      irrigationDateFrom: "",
      irrigationDateTo: "",
    },
  });

  // Load irrigations on mount and when farmId changes
  useEffect(() => {
    if (farmId && canList) {
      fetchIrrigations(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, canList]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (irrigationError) {
      showToast(irrigationError, "red");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [irrigationError]);

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
      fetchIrrigations(1, {
        search: searchValue || undefined,
        fieldId: currentFilters.fieldId !== "all" ? currentFilters.fieldId : undefined,
        irrigationDateFrom: currentFilters.irrigationDateFrom || undefined,
        irrigationDateTo: currentFilters.irrigationDateTo || undefined,
      });
    }, 300);
  };

  // Handle filter changes from drawer
  const handleApplyFilters = (newFilters: FilterValues) => {
    filterForm.setValues(newFilters);
    fetchIrrigations(1, {
      search: newFilters.search || undefined,
      fieldId: newFilters.fieldId !== "all" ? newFilters.fieldId : undefined,
      irrigationDateFrom: newFilters.irrigationDateFrom || undefined,
      irrigationDateTo: newFilters.irrigationDateTo || undefined,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    filterForm.setValues({
      search: "",
      fieldId: "all",
      irrigationDateFrom: "",
      irrigationDateTo: "",
    });
    fetchIrrigations(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchIrrigations(page, {
      search: filterForm.values.search || undefined,
      fieldId: filterForm.values.fieldId !== "all" ? filterForm.values.fieldId : undefined,
      irrigationDateFrom: filterForm.values.irrigationDateFrom || undefined,
      irrigationDateTo: filterForm.values.irrigationDateTo || undefined,
    });
  };

  // Handle create
  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await createIrrigation(values);
      if (success) {
        showToast("Irrigation record created successfully", "green");
        setModalOpen(false);
      } else {
        showToast("Failed to create irrigation record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ?? err?.message ?? "Failed to create irrigation record";
      setError(errorMessage);
      showToast(errorMessage, "red");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async (values: any) => {
    if (!selectedIrrigation) return;
    setIsUpdating(true);
    setError(null);
    try {
      const success = await updateIrrigation(selectedIrrigation.id, values);
      if (success) {
        showToast("Irrigation record updated successfully", "green");
        setUpdateModalOpen(false);
        setSelectedIrrigation(null);
      } else {
        showToast("Failed to update irrigation record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ?? err?.message ?? "Failed to update irrigation record";
      setError(errorMessage);
      showToast(errorMessage, "red");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!irrigationToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const success = await deleteIrrigation(irrigationToDelete.id);
      if (success) {
        showToast("Irrigation record deleted successfully", "green");
        setDeleteModalOpen(false);
        setIrrigationToDelete(null);
      } else {
        showToast("Failed to delete irrigation record", "red");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ?? err?.message ?? "Failed to delete irrigation record";
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
          You don't have permission to view irrigation records.
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
        {/* Toast */}
        <div style={{ flexShrink: 0 }}>
          <Toast />
        </div>
      <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>

        {/* Header */}
        <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
          <div>
            <Title order={2}>Irrigation</Title>
            <Text c="dimmed" size="sm">
              Track and manage irrigation activities across your fields.
            </Text>
          </div>
          {canCreate && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Irrigation
            </Button>
          )}
        </Group>

      {/* Search and Filters */}
      <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
        <BaseInput
          placeholder="Search by field name"
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
              // Clear timeout and search immediately on Enter
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              const currentFilters = filterForm.values;
              fetchIrrigations(1, {
                search: currentFilters.search || undefined,
                fieldId: currentFilters.fieldId !== "all" ? currentFilters.fieldId : undefined,
                irrigationDateFrom: currentFilters.irrigationDateFrom || undefined,
                irrigationDateTo: currentFilters.irrigationDateTo || undefined,
              });
            }
          }}
        />
        <IrrigationFilters onOpenFilters={() => setFiltersDrawerOpen(true)} />
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
          <IrrigationTable
            irrigations={irrigations}
            pagination={pagination}
            isLoading={isLoading}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onUpdate={(irrigation) => {
              setSelectedIrrigation(irrigation);
              setUpdateModalOpen(true);
            }}
            onDelete={(irrigation) => {
              setIrrigationToDelete(irrigation);
              setDeleteModalOpen(true);
            }}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modals */}
      <AddIrrigationModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError(null);
        }}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <UpdateIrrigationModal
        opened={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedIrrigation(null);
          setError(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        irrigation={selectedIrrigation}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setIrrigationToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Irrigation Record"
        message={
          irrigationToDelete
            ? `Are you sure you want to delete the irrigation record for ${irrigationToDelete.fieldName || "this field"}? This action cannot be undone.`
            : "Are you sure you want to delete this irrigation record? This action cannot be undone."
        }
        // isLoading={isDeleting}
      />

      <IrrigationFiltersDrawer
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

