"use client";

import { useState, useEffect } from "react";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type { ExpenseRecord, FilterValues, CreateExpenseData } from "./types";
import { useExpenses } from "./hooks";
import { ExpenseModal } from "./modals";
import { ExpenseTable, ExpenseFilters, ExpenseFiltersDrawer } from "./components";

export default function ExpenseSection() {
    const { permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("FINANCE", "LISTING", permissions, role) ||
        hasPermission("FINANCE", "READ", permissions, role);
    const canCreate = hasPermission("FINANCE", "CREATE", permissions, role);
    const canUpdate = hasPermission("FINANCE", "UPDATE", permissions, role);
    const canDelete = hasPermission("FINANCE", "DELETE", permissions, role);

    // Hooks
    const {
        expenses,
        isLoading,
        pagination,
        error: expensesError,
        fetchExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        setPagination,
    } = useExpenses();

    // Modal/Drawer states
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [expenseToUpdate, setExpenseToUpdate] = useState<ExpenseRecord | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);

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
            categoryId: "all",
            expenseDateFrom: "",
            expenseDateTo: "",
        },
    });

    // Fetch expenses on mount and when filters change
    useEffect(() => {
        if (canList) {
            void fetchExpenses(pagination.page, {
                search: filterForm.values.search || undefined,
                categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
                expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
                expenseDateTo: filterForm.values.expenseDateTo || undefined,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        canList,
        filterForm.values.search,
        filterForm.values.categoryId,
        filterForm.values.expenseDateFrom,
        filterForm.values.expenseDateTo,
        pagination.page,
        pagination.limit,
    ]);

    // Handle errors from hooks
    useEffect(() => {
        if (expensesError) {
            setError(expensesError);
            showToast(expensesError, "red");
        }
    }, [expensesError]);

    // Handle create expense
    const handleCreateExpense = async (values: unknown) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const success = await createExpense(values as CreateExpenseData);

            if (success) {
                setModalOpen(false);
                showToast("Expense created successfully", "green");
                void fetchExpenses(pagination.page, {
                    search: filterForm.values.search || undefined,
                    categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
                    expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
                    expenseDateTo: filterForm.values.expenseDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create expense";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update expense
    const handleUpdateExpense = async (values: unknown) => {
        if (!expenseToUpdate) return;

        setIsUpdating(true);
        setError(null);

        try {
            const success = await updateExpense(expenseToUpdate.id, values as CreateExpenseData);

            if (success) {
                setUpdateModalOpen(false);
                setExpenseToUpdate(null);
                showToast("Expense updated successfully", "green");
                void fetchExpenses(pagination.page, {
                    search: filterForm.values.search || undefined,
                    categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
                    expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
                    expenseDateTo: filterForm.values.expenseDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update expense";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete expense
    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const success = await deleteExpense(expenseToDelete.id);

            if (success) {
                setDeleteModalOpen(false);
                setExpenseToDelete(null);
                showToast("Expense deleted successfully", "green");
                void fetchExpenses(pagination.page, {
                    search: filterForm.values.search || undefined,
                    categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
                    expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
                    expenseDateTo: filterForm.values.expenseDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete expense";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle search change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.currentTarget.value;
        filterForm.setFieldValue("search", searchValue);
        void fetchExpenses(1, {
            search: searchValue || undefined,
            categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
            expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
            expenseDateTo: filterForm.values.expenseDateTo || undefined,
        });
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

    // Handle pagination changes
    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, page });
    };

    // Handle edit click
    const handleEditClick = (expense: ExpenseRecord) => {
        setExpenseToUpdate(expense);
        setUpdateModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (expense: ExpenseRecord) => {
        setExpenseToDelete(expense);
        setDeleteModalOpen(true);
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">You don't have permission to view expenses.</Text>
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
                maxWidth: "100%",
            }}
        >
            {/* Header - Fixed */}
            <Group justify="space-between" align="center" mb="lg" style={{ flexShrink: 0 }}>
                <div>
                    <Title order={2}>Expenses</Title>
                    <Text c="dimmed" size="sm">
                        Manage expenses and track farm expenditures
                    </Text>
                </div>
                {canCreate && (
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Expense
                    </Button>
                )}
            </Group>

            {/* Toast - Fixed */}
            <div style={{ flexShrink: 0, marginBottom: "1rem" }}>
                <Toast />
            </div>

            {/* Content - Scrollable */}
            <Stack gap="lg" style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                {/* Search and Filters */}
                <Group gap="md" align="stretch" justify="space-between" wrap="wrap">
                    <BaseInput
                        placeholder="Search by vendor, description..."
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
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                void fetchExpenses(1, {
                                    search: filterForm.values.search || undefined,
                                    categoryId: filterForm.values.categoryId !== "all" ? filterForm.values.categoryId : undefined,
                                    expenseDateFrom: filterForm.values.expenseDateFrom || undefined,
                                    expenseDateTo: filterForm.values.expenseDateTo || undefined,
                                });
                            }
                        }}
                    />
                    <ExpenseFilters
                        onOpenFilters={() => setFiltersDrawerOpen(true)}
                    />
                </Group>

                {/* Table */}
                <div style={{ width: "100%" }}>
                    <ExpenseTable
                        expenses={expenses}
                        pagination={pagination}
                        isLoading={isLoading}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        onUpdate={handleEditClick}
                        onDelete={handleDeleteClick}
                        onPageChange={handlePageChange}
                    />
                </div>
            </Stack>

            {/* Modals */}
            {canCreate && (
                <ExpenseModal
                    mode="create"
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreateExpense}
                    isSubmitting={isSubmitting}
                />
            )}

            {canUpdate && expenseToUpdate && (
                <ExpenseModal
                    mode="update"
                    expense={expenseToUpdate}
                    opened={updateModalOpen}
                    onClose={() => {
                        setUpdateModalOpen(false);
                        setExpenseToUpdate(null);
                    }}
                    onSubmit={handleUpdateExpense}
                    isSubmitting={isUpdating}
                />
            )}

            {/* Filters Drawer */}
            <ExpenseFiltersDrawer
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
                    setExpenseToDelete(null);
                }}
                onConfirm={handleDeleteExpense}
                title="Delete Expense"
                message={`Are you sure you want to delete this expense of ${expenseToDelete?.currencyType} ${expenseToDelete?.amount}? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={`${expenseToDelete?.currencyType} ${expenseToDelete?.amount}`}
                itemType="expense"
            />
        </Paper>
    );
}

