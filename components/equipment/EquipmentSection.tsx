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
import type { EquipmentRecord, FilterValues, AddEquipmentValues, UpdateEquipmentValues } from "./types";
import { useEquipment } from "./hooks";
import { AddEquipmentModal, UpdateEquipmentModal } from "./modals";
import {
  MaintenanceLogsDrawer,
  EquipmentFiltersDrawer,
} from "./drawers";
import { EquipmentTable, EquipmentFilters } from "./components";

export default function EquipmentSection() {
  const { farmId, permissions, role } = useAuth();

  // Permission checks
  const canList =
    hasPermission("EQUIPMENT", "LIST", permissions, role) ||
    hasPermission("EQUIPMENT", "READ", permissions, role);
  const canCreate = hasPermission("EQUIPMENT", "CREATE", permissions, role);
  const canUpdate = hasPermission("EQUIPMENT", "UPDATE", permissions, role);
  const canDelete = hasPermission("EQUIPMENT", "DELETE", permissions, role);

  // Hooks
  const {
    equipment,
    isLoading,
    pagination,
    error: equipmentError,
    fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    setPagination,
  } = useEquipment();

  // Modal/Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [maintenanceDrawerOpen, setMaintenanceDrawerOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentRecord | null>(null);
  const [equipmentForMaintenance, setEquipmentForMaintenance] = useState<EquipmentRecord | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentRecord | null>(null);
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
      equipmentType: "all",
      status: "all",
    },
  });

  // Load equipment on mount and when farmId changes
  useEffect(() => {
    if (farmId && canList) {
      fetchEquipment(1);
    }
  }, [farmId, canList]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (equipmentError) {
      showToast(equipmentError, "red");
    }
  }, [equipmentError]);

  // Calculate active filters count (excluding search)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterForm.values.equipmentType !== "all") count++;
    if (filterForm.values.status !== "all") count++;
    return count;
  };

  // Handle search change
  const handleSearchChange = (searchValue: string) => {
    filterForm.setFieldValue("search", searchValue);
    fetchEquipment(1, {
      search: searchValue || undefined,
      equipmentType: filterForm.values.equipmentType !== "all" ? filterForm.values.equipmentType : undefined,
      status: filterForm.values.status !== "all" ? filterForm.values.status : undefined,
    });
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: FilterValues) => {
    filterForm.setValues(newFilters);
    fetchEquipment(1, {
      search: newFilters.search || undefined,
      equipmentType: newFilters.equipmentType !== "all" ? newFilters.equipmentType : undefined,
      status: newFilters.status !== "all" ? newFilters.status : undefined,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      search: filterForm.values.search, // Keep search
      equipmentType: "all",
      status: "all",
    };
    filterForm.setValues(clearedFilters);
    fetchEquipment(1, {
      search: clearedFilters.search || undefined,
      equipmentType: undefined,
      status: undefined,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    fetchEquipment(page, {
      search: filterForm.values.search || undefined,
      equipmentType: filterForm.values.equipmentType !== "all" ? filterForm.values.equipmentType : undefined,
      status: filterForm.values.status !== "all" ? filterForm.values.status : undefined,
    });
  };

  // Handle add equipment
  const handleAddEquipment = async (values: AddEquipmentValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createEquipment({
        equipmentName: values.equipmentName,
        equipmentType: values.equipmentType ? values.equipmentType : undefined,
        brand: values.brand ? values.brand : undefined,
        model: values.model ? values.model : undefined,
        serialNumber: values.serialNumber ? values.serialNumber : undefined,
        purchaseDate: values.purchaseDate ? values.purchaseDate : undefined,
        purchaseCost: values.purchaseCost === "" ? undefined : values.purchaseCost,
        status: values.status,
        notes: values.notes ? values.notes : undefined,
        photo: values.photo,
      });
      if (result.success) {
        showToast("Equipment added successfully!", "green");
        setModalOpen(false);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to add equipment"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to add equipment",
        "red"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update equipment
  const handleUpdateEquipment = async (values: UpdateEquipmentValues) => {
    if (!selectedEquipment) return;

    setIsUpdating(true);
    setError(null);

    try {
      // Convert empty strings to undefined for optional fields
      const updateData: any = {};
      if (values.equipmentName !== undefined) updateData.equipmentName = values.equipmentName;
      if (values.equipmentType !== undefined) updateData.equipmentType = values.equipmentType;
      if (values.brand !== undefined) updateData.brand = values.brand;
      if (values.model !== undefined) updateData.model = values.model;
      if (values.serialNumber !== undefined) updateData.serialNumber = values.serialNumber;
      if (values.purchaseDate !== undefined) updateData.purchaseDate = values.purchaseDate;
      if (values.purchaseCost !== undefined) updateData.purchaseCost = values.purchaseCost === "" ? undefined : values.purchaseCost;
      if (values.status !== undefined) updateData.status = values.status;
      if (values.notes !== undefined) updateData.notes = values.notes;
      if (values.photo !== undefined) updateData.photo = values.photo;

      const result = await updateEquipment(selectedEquipment.id, updateData);
      if (result.success) {
        showToast("Equipment updated successfully!", "green");
        setUpdateModalOpen(false);
        setSelectedEquipment(null);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update equipment"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to update equipment",
        "red"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete equipment
  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteEquipment(equipmentToDelete.id);
      if (result.success) {
        showToast("Equipment deleted successfully!", "green");
        setDeleteModalOpen(false);
        setEquipmentToDelete(null);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to delete equipment"
      );
      showToast(
        err?.response?.data?.message || err?.message || "Failed to delete equipment",
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
          You don't have permission to view equipment.
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
            <Title order={2}>Equipment</Title>
            <Text c="dimmed" size="sm">
              Manage your farm equipment and maintenance logs
            </Text>
          </div>
          {canCreate && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Equipment
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
            placeholder="Search by equipment name, brand, or model"
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
          <EquipmentFilters 
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
            <EquipmentTable
              equipment={equipment}
              pagination={pagination}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onUpdate={(equipment) => {
                setSelectedEquipment(equipment);
                setUpdateModalOpen(true);
              }}
              onDelete={(equipment) => {
                setEquipmentToDelete(equipment);
                setDeleteModalOpen(true);
              }}
              onOpenMaintenance={(equipment) => {
                setEquipmentForMaintenance(equipment);
                setMaintenanceDrawerOpen(true);
              }}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Stack>

      {/* Modals */}
      <AddEquipmentModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddEquipment}
        isSubmitting={isSubmitting}
      />

      <UpdateEquipmentModal
        opened={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleUpdateEquipment}
        isSubmitting={isUpdating}
        equipment={selectedEquipment}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEquipmentToDelete(null);
        }}
        onConfirm={() => {
          void handleDeleteEquipment();
        }}
        title="Delete Equipment"
        subtitle={`Are you sure you want to delete "${equipmentToDelete?.equipmentName || "this equipment"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDeleting={isDeleting}
      />

      {/* Drawers */}
      <MaintenanceLogsDrawer
        opened={maintenanceDrawerOpen}
        onClose={() => {
          setMaintenanceDrawerOpen(false);
          setEquipmentForMaintenance(null);
        }}
        equipment={equipmentForMaintenance}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Filters Drawer */}
      <EquipmentFiltersDrawer
        opened={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filterForm.values}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </Paper>
  );
}

