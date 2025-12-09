"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Group,
    Paper,
    Pagination,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import type {
    CropHealthNoteRecord,
    FilterValues,
} from "./types";
import { useCropHealthNotes } from "./hooks";
import {
    CropHealthNoteTimeline,
    CropHealthNoteFilters,
    CropHealthNoteFiltersDrawer,
} from "./components";

export default function CropHealthNotesSection() {
    const router = useRouter();
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
        notes,
        isLoading,
        pagination,
        error: notesError,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        setPagination,
    } = useCropHealthNotes();

    // Modal/Drawer states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<CropHealthNoteRecord | null>(null);

    // Messages
    const [error, setError] = useState<string | null>(null);
    const { Toast, showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    // Search and filters
    const filterForm = useForm<FilterValues>({
        initialValues: {
            search: "",
            fieldId: "all",
            dateFrom: "",
            dateTo: "",
            healthStatus: "",
        },
    });

    // Fetch notes on mount and when filters change
    useEffect(() => {
        if (farmId && canList) {
            void fetchNotes(pagination.page, {
                fieldId: filterForm.values.fieldId !== "all" ? filterForm.values.fieldId : undefined,
                dateFrom: filterForm.values.dateFrom || undefined,
                dateTo: filterForm.values.dateTo || undefined,
            });
        }
    }, [
        farmId,
        canList,
        filterForm.values.fieldId,
        filterForm.values.dateFrom,
        filterForm.values.dateTo,
        pagination.page,
        pagination.limit,
    ]);

    // Handle errors from hooks
    useEffect(() => {
        if (notesError) {
            setError(notesError);
            showToast(notesError, "red");
        }
    }, [notesError]);

    // Handle delete note
    const handleDeleteNote = async () => {
        if (!noteToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const success = await deleteNote(noteToDelete.id);

            if (success) {
                setDeleteModalOpen(false);
                setNoteToDelete(null);
                showToast("Crop health note deleted successfully", "green");
                void fetchNotes(pagination.page, {
                    fieldId: filterForm.values.fieldId !== "all" ? filterForm.values.fieldId : undefined,
                    dateFrom: filterForm.values.dateFrom || undefined,
                    dateTo: filterForm.values.dateTo || undefined,
                });
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete crop health note";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle search change (client-side filtering)
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.currentTarget.value;
        filterForm.setFieldValue("search", searchValue);
        // Note: Search is handled client-side, API doesn't support it
        void fetchNotes(1, {
            fieldId: filterForm.values.fieldId !== "all" ? filterForm.values.fieldId : undefined,
            dateFrom: filterForm.values.dateFrom || undefined,
            dateTo: filterForm.values.dateTo || undefined,
        });
    };

    // Handle filter apply
    const handleApplyFilters = (newFilters: FilterValues) => {
        filterForm.setValues(newFilters);
        setFiltersDrawerOpen(false);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        filterForm.reset();
        setFiltersDrawerOpen(false);
    };

    // Handle view click
    const handleViewClick = (note: CropHealthNoteRecord) => {
        router.push(`/crops/health-notes/${note.id}`);
    };

    // Handle edit click
    const handleEditClick = (note: CropHealthNoteRecord) => {
        router.push(`/crops/health-notes/${note.id}/edit`);
    };

    // Handle delete click
    const handleDeleteClick = (note: CropHealthNoteRecord) => {
        setNoteToDelete(note);
        setDeleteModalOpen(true);
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">You don't have permission to view crop health notes.</Text>
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
            <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
                {/* Header */}
                <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
                    <div>
                        <Title order={2}>Crop Health Notes</Title>
                        <Text c="dimmed" size="sm">
                            Record observations about crop health and track changes over time
                        </Text>
                    </div>
                    {canCreate && (
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => router.push("/crops/health-notes/new")}
                        >
                            New Note
                        </Button>
                    )}
                </Group>

                {/* Toast */}
                <div style={{ flexShrink: 0 }}>
                    <Toast />
                </div>

                {/* Search and Filters */}
                <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <TextInput
                        size={"md"}
                        placeholder="Search notes..."
                        leftSection={<IconSearch size={16} />}
                        style={{
                            width: "100%",
                            maxWidth: 500,
                            flex: "1 1 0",
                            minWidth: 0,
                        }}
                        radius={6}
                        value={filterForm.values.search}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                void fetchNotes(1, {
                                    fieldId: filterForm.values.fieldId !== "all" ? filterForm.values.fieldId : undefined,
                                    dateFrom: filterForm.values.dateFrom || undefined,
                                    dateTo: filterForm.values.dateTo || undefined,
                                });
                            }
                        }}
                    />
                    <CropHealthNoteFilters
                        onOpenFilters={() => setFiltersDrawerOpen(true)}
                    />
                </Group>

                {/* Timeline - Scrollable container */}
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
                        <CropHealthNoteTimeline
                            notes={notes}
                            isLoading={isLoading}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={handleViewClick}
                            onUpdate={handleEditClick}
                            onDelete={handleDeleteClick}
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
                            onChange={(page) => setPagination({ ...pagination, page })}
                            total={pagination.totalPages}
                            size="sm"
                        />
                    </Group>
                )}
            </Stack>

            {/* Filters Drawer */}
            <CropHealthNoteFiltersDrawer
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
                    setNoteToDelete(null);
                }}
                onConfirm={handleDeleteNote}
                title="Delete Crop Health Note"
                message={`Are you sure you want to delete this crop health note? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={noteToDelete?.fieldName || ""}
                itemType="crop health note"
            />
        </Paper>
    );
}

