"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Group,
  Paper,
  Pagination,
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
import type { FieldRecord, FilterValues } from "./types";
import { useFields } from "./hooks";
import { AddFieldModal, UpdateFieldModal } from "./modals";
import { FieldTable, FieldFilters, FieldFiltersDrawer } from "./components";

export default function FieldsSection() {
  const { farmId, permissions, role } = useAuth();

  // Permission checks - Using CROPS module permissions for now, can be changed to FIELDS later
  const canList =
    hasPermission("CROPS", "LIST", permissions, role) ||
    hasPermission("CROPS", "READ", permissions, role);
  const canCreate = hasPermission("CROPS", "CREATE", permissions, role);
  const canUpdate = hasPermission("CROPS", "UPDATE", permissions, role);
  const canDelete = hasPermission("CROPS", "DELETE", permissions, role);

  // Hooks
  const {
    fields,
    isLoading,
    pagination,
    error: fieldsError,
    fetchFields,
    createField,
    updateField,
    deleteField,
    setPagination,
  } = useFields();

  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldRecord | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<FieldRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Toast, showToast } = useToast();

  // Filter form
  const filterForm = useForm<FilterValues>({
    initialValues: {
      search: "",
      soilType: "all",
      isActive: "all",
    },
  });

  // Load fields on mount and when farmId changes
  useEffect(() => {
    if (farmId && canList) {
      fetchFields(1);
    }
  }, [farmId, canList]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (fieldsError) {
      showToast(fieldsError, "red");
    }
  }, [fieldsError]);

  // Handle search change
  const handleSearchChange = (searchValue: string) => {
    filterForm.setFieldValue("search", searchValue);
    const isActiveValue =
      filterForm.values.isActive !== "all"
        ? filterForm.values.isActive === "true"
          ? true
          : false
        : undefined;
    fetchFields(1, {
      search: searchValue || undefined,
      soilType:
        filterForm.values.soilType !== "all"
          ? filterForm.values.soilType
          : undefined,
      isActive: isActiveValue,
    });
  };

  // Handle filter changes from drawer
  const handleApplyFilters = (newFilters: FilterValues) => {
    filterForm.setValues(newFilters);
    const isActiveValue =
      newFilters.isActive !== "all"
        ? newFilters.isActive === "true"
          ? true
          : false
        : undefined;
    fetchFields(1, {
      search: newFilters.search || undefined,
      soilType: newFilters.soilType !== "all" ? newFilters.soilType : undefined,
      isActive: isActiveValue,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      search: filterForm.values.search, // Keep search
      soilType: "all",
      isActive: "all",
    };
    filterForm.setValues(clearedFilters);
    fetchFields(1, {
      search: clearedFilters.search || undefined,
      soilType: undefined,
      isActive: undefined,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    const isActiveValue =
      filterForm.values.isActive !== "all"
        ? filterForm.values.isActive === "true"
          ? true
          : false
        : undefined;
    fetchFields(page, {
      search: filterForm.values.search || undefined,
      soilType:
        filterForm.values.soilType !== "all"
          ? filterForm.values.soilType
          : undefined,
      isActive: isActiveValue,
    });
  };

  // Handle add field
  const handleAddField = async (values: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await createField({
        fieldName: values.fieldName,
        fieldSize: values.fieldSize,
        sizeUnit: values.sizeUnit,
        soilType: values.soilType,
        isActive: values.isActive,
        notes: values.notes,
      });

      if (success) {
        showToast("Field added successfully!", "green");
        setModalOpen(false);
      } else {
        const message = "Failed to add field";
        setError(message);
        showToast(message, "red");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to add field"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to add field",
        "red"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update field
  const handleUpdateField = async (values: any) => {
    if (!selectedField) return;

    setIsUpdating(true);
    setError(null);

    try {
      const success = await updateField(selectedField.id, {
        fieldName: values.fieldName,
        fieldSize: values.fieldSize,
        sizeUnit: values.sizeUnit,
        soilType: values.soilType,
        isActive: values.isActive,
        notes: values.notes,
      });

      if (success) {
        showToast("Field updated successfully!", "green");
        setUpdateModalOpen(false);
        setSelectedField(null);
      } else {
        const message = "Failed to update field";
        setError(message);
        showToast(message, "red");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update field"
      );
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update field",
        "red"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete field
  const handleDeleteField = async () => {
    if (!fieldToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const success = await deleteField(fieldToDelete.id);

      if (success) {
        showToast("Field deleted successfully!", "green");
        setDeleteModalOpen(false);
        setFieldToDelete(null);
      } else {
        const message = "Failed to delete field";
        setError(message);
        showToast(message, "red");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to delete field"
      );
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete field",
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
          You don't have permission to view fields.
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
            <Title order={2}>Fields</Title>
            <Text c="dimmed" size="sm">
              Manage your farm fields and their properties
            </Text>
          </div>
          {canCreate && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Field
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
                handleSearchChange(filterForm.values.search);
              }
            }}
          />
          <FieldFilters onOpenFilters={() => setFiltersDrawerOpen(true)} />
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
            <FieldTable
              fields={fields}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onUpdate={(field) => {
                setSelectedField(field);
                setUpdateModalOpen(true);
              }}
              onDelete={(field) => {
                setFieldToDelete(field);
                setDeleteModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Group 
            justify="center" 
            style={{ 
              flexShrink: 0,
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            <Pagination
              value={pagination.page}
              onChange={handlePageChange}
              total={pagination.totalPages}
              size="sm"
            />
          </Group>
        )}
      </Stack>

      {/* Modals */}
      <AddFieldModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddField}
        isSubmitting={isSubmitting}
      />

      <UpdateFieldModal
        opened={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedField(null);
        }}
        onSubmit={handleUpdateField}
        isSubmitting={isUpdating}
        field={selectedField}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFieldToDelete(null);
        }}
        onConfirm={() => {
          void handleDeleteField();
        }}
                title="Delete Field"
                subtitle={`Are you sure you want to delete "${fieldToDelete?.fieldName || "this field"}"? This action cannot be undone.`}
                confirmLabel="Delete"
                isDeleting={isDeleting}
      />

      {/* Filters Drawer */}
      <FieldFiltersDrawer
        opened={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filterForm.values}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </Paper>
  );
}
