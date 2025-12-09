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
import type { AnimalGroup, AddGroupValues, AssignAnimalsValues, UpdateGroupValues, AnimalRecord } from "./types";
import {
  getGroups,
  createGroup,
  updateGroup,
  assignAnimalsToGroup,
  removeAnimalsFromGroup,
  deleteGroup,
  getGroupDetails,
} from "@/lib/livestock/api";
import { GroupsTable } from "./components";
import { AddGroupModal, UpdateGroupModal, AssignAnimalsModal } from "./modals";
import { getAnimals } from "@/lib/livestock/api";

export default function GroupsSection() {
  const { farmId, permissions, role } = useAuth();

  // Permission checks
  const canList =
    hasPermission("LIVESTOCK", "LIST", permissions, role) ||
    hasPermission("LIVESTOCK", "READ", permissions, role);
  const canCreate = hasPermission("LIVESTOCK", "CREATE", permissions, role);
  const canUpdate = hasPermission("LIVESTOCK", "UPDATE", permissions, role);
  const canDelete = hasPermission("LIVESTOCK", "DELETE", permissions, role);

  // State management
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Toast, showToast } = useToast();

  // Get all animals for assign modal - we'll fetch them when needed
  const [allAnimals, setAllAnimals] = useState<AnimalRecord[]>([]);
  const [isLoadingAllAnimals, setIsLoadingAllAnimals] = useState(false);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AnimalGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<AnimalGroup | null>(null);
  const [currentGroupAnimalIds, setCurrentGroupAnimalIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search form
  const searchForm = useForm({
    initialValues: {
      search: "",
    },
  });

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
        err?.response?.data?.message ?? err?.message ?? "Failed to fetch groups"
      );
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed to fetch groups",
        "red"
      );
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all animals for assign modal (only when needed)
  const fetchAllAnimals = async () => {
    if (!farmId) {
      showToast("Farm ID is required", "red");
      return;
    }
    setIsLoadingAllAnimals(true);
    try {
      // Use a safe limit (50 is typically safe for most APIs)
      const limit = 50;
      const response = await getAnimals({ page: 1, limit });
      const responseData = response.data ?? response;
      const animalsData = responseData?.animals ?? [];
      const paginationData = responseData?.pagination;
      
      // Map API response to AnimalRecord format
      const mapToAnimalRecord = (animal: any): AnimalRecord => ({
        id: animal.id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        gender: animal.gender as "Male" | "Female" | "Unknown",
        birthdate: animal.birthdate,
        photo: animal.photo,
        isActive: animal.isActive,
        createdAt: animal.createdAt,
        updatedAt: animal.updatedAt,
      });
      
      // If there are more pages, fetch them
      const totalPages = paginationData?.totalPages ?? 1;
      if (totalPages > 1) {
        const allAnimalsData = animalsData.map(mapToAnimalRecord);
        
        // Fetch remaining pages
        for (let page = 2; page <= totalPages; page++) {
          const nextResponse = await getAnimals({ page, limit });
          const nextData = nextResponse.data ?? nextResponse;
          const nextAnimals = (nextData?.animals ?? []).map(mapToAnimalRecord);
          allAnimalsData.push(...nextAnimals);
        }
        setAllAnimals(allAnimalsData);
      } else {
        setAllAnimals(animalsData.map(mapToAnimalRecord));
      }
    } catch (err: any) {
      console.error("Failed to fetch animals:", err);
      const errorMessage = err?.response?.data?.message ?? err?.message ?? "Failed to load animals";
      showToast(errorMessage, "red");
      setAllAnimals([]); // Clear animals on error
    } finally {
      setIsLoadingAllAnimals(false);
    }
  };

  // Load groups on mount
  useEffect(() => {
    if (farmId && canList) {
      fetchGroups(1);
    }
  }, [farmId, canList]);

  // Handle search change
  const handleSearchChange = (searchValue: string) => {
    searchForm.setFieldValue("search", searchValue);
    fetchGroups(1, searchValue);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    fetchGroups(page, searchForm.values.search);
  };

  // Handle create group
  const handleCreateGroup = async (values: AddGroupValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createGroup(values);
      showToast("Group created successfully!", "green");
      setAddModalOpen(false);
      await fetchGroups(pagination.page, searchForm.values.search);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to create group"
      );
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed to create group",
        "red"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update group
  const handleUpdateGroup = async (values: UpdateGroupValues) => {
    if (!selectedGroup) return;

    setIsUpdating(true);
    setError(null);
    try {
      await updateGroup(selectedGroup.id, values);
      showToast("Group updated successfully!", "green");
      setUpdateModalOpen(false);
      setSelectedGroup(null);
      await fetchGroups(pagination.page, searchForm.values.search);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to update group"
      );
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed to update group",
        "red"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteGroup(groupToDelete.id);
      showToast("Group deleted successfully!", "green");
      setDeleteModalOpen(false);
      setGroupToDelete(null);
      await fetchGroups(pagination.page, searchForm.values.search);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to delete group"
      );
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed to delete group",
        "red"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle assign animals
  const handleAssignAnimals = async (group: AnimalGroup) => {
    setSelectedGroup(group);
    try {
      // Fetch fresh animals list first
      await fetchAllAnimals();
      
      // Then fetch group details
      const groupDetails = await getGroupDetails(group.id);
      const ids = groupDetails.animals?.map((assignment) => assignment.animal.id) ?? [];
      setCurrentGroupAnimalIds(ids);
      setAssignModalOpen(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ?? err?.message ?? "Failed to load group details";
      console.error("Error in handleAssignAnimals:", err);
      showToast(errorMessage, "red");
    }
  };

  const handleAssignAnimalsSubmit = async (values: AssignAnimalsValues) => {
    if (!selectedGroup) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const currentIds = currentGroupAnimalIds;
      const newIds = values.animalIds;

      const animalsToAdd = newIds.filter((id) => !currentIds.includes(id));
      const animalsToRemove = currentIds.filter((id) => !newIds.includes(id));

      if (animalsToRemove.length > 0) {
        await removeAnimalsFromGroup(selectedGroup.id, animalsToRemove);
      }

      if (animalsToAdd.length > 0) {
        await assignAnimalsToGroup(selectedGroup.id, animalsToAdd);
      }

      showToast("Animals assigned successfully!", "green");
      setAssignModalOpen(false);
      setSelectedGroup(null);
      setCurrentGroupAnimalIds([]);
      await fetchGroups(pagination.page, searchForm.values.search);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to assign animals"
      );
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed to assign animals",
        "red"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canList) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Text c="dimmed" ta="center">
          You don't have permission to view animal groups.
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
            <Title order={2}>Animal Groups</Title>
            <Text c="dimmed" size="sm">
              Organize animals into groups for better management
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

        {/* Toast */}
        <div style={{ flexShrink: 0 }}>
          <Toast />
        </div>

        {/* Search */}
        <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
          <BaseInput
            placeholder="Search by group name"
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
            value={searchForm.values.search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchChange(searchForm.values.search);
              }
            }}
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
            <GroupsTable
              groups={groups}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onUpdate={(group) => {
                setSelectedGroup(group);
                setUpdateModalOpen(true);
              }}
              onDelete={(group) => {
                setGroupToDelete(group);
                setDeleteModalOpen(true);
              }}
              onAssignAnimals={handleAssignAnimals}
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
        availableAnimals={allAnimals}
        currentAnimalIds={currentGroupAnimalIds}
        isLoadingAnimals={isLoadingAllAnimals}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={() => {
          void handleDeleteGroup();
        }}
        title="Delete Group"
        subtitle={`Are you sure you want to delete "${groupToDelete?.name || "this group"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDeleting={isDeleting}
      />
    </Paper>
  );
}

