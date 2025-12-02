"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Drawer,
    Group,
    Loader,
    Notification,
    Pagination,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import { IconEdit, IconPlus, IconX } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import type { AnimalRecord, HealthRecord, PaginationInfo } from "../types";
import { formatDate } from "@/lib/livestock/utils";
import {
    getHealthRecords,
    createHealthRecord,
    updateHealthRecord,
} from "@/lib/livestock/api";
import HealthRecordModal from "../modals/HealthRecordModal";
import HealthRecordUpdateModal from "../modals/HealthRecordUpdateModal";

interface HealthRecordsDrawerProps {
    opened: boolean;
    onClose: () => void;
    animal: AnimalRecord | null;
}

export default function HealthRecordsDrawer({
    opened,
    onClose,
    animal,
}: HealthRecordsDrawerProps) {
    const { permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("LIVESTOCK", "LIST", permissions, role) ||
        hasPermission("LIVESTOCK", "READ", permissions, role);
    const canCreate = hasPermission("LIVESTOCK", "CREATE", permissions, role);
    const canUpdate = hasPermission("LIVESTOCK", "UPDATE", permissions, role);

    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchRecords = async (page: number = 1) => {
        if (!animal?.id || !canList) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHealthRecords(animal.id, {
                page,
                limit: pagination.limit,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });
            setRecords(response.records);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch health records"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (opened && animal?.id && canList) {
            fetchRecords(1);
        } else if (!opened) {
            // Clear filters when drawer closes
            setDateFrom("");
            setDateTo("");
            setPagination((prev) => ({ ...prev, page: 1 }));
        }
    }, [opened, animal?.id, canList]);

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    const handleCreate = async (values: {
        type: string;
        name: string;
        cost: number | null;
        nextDueDate: string | null;
        description: string | null;
    }) => {
        if (!animal?.id || !canCreate) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await createHealthRecord(animal.id, {
                recordType: values.type,
                name: values.name,
                cost: values.cost ?? undefined,
                nextDueDate: values.nextDueDate ?? undefined,
                description: values.description ?? undefined,
            });
            setSuccessMessage("Health record created successfully");
            setCreateModalOpen(false);
            await fetchRecords(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to create health record"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (values: {
        type: string;
        name: string;
        cost: number | null;
        nextDueDate: string | null;
        description: string | null;
    }) => {
        if (!animal?.id || !selectedRecord || !canUpdate) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await updateHealthRecord(animal.id, selectedRecord.id, {
                recordType: values.type,
                name: values.name,
                cost: values.cost ?? undefined,
                nextDueDate: values.nextDueDate ?? undefined,
                description: values.description ?? undefined,
            });
            setSuccessMessage("Health record updated successfully");
            setUpdateModalOpen(false);
            setSelectedRecord(null);
            await fetchRecords(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update health record"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilter = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchRecords(1);
    };

    const handleClearFilters = () => {
        setDateFrom("");
        setDateTo("");
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchRecords(1);
    };

    if (!canList) {
        return (
            <Drawer
                opened={opened}
                onClose={onClose}
                title={`Health Records - ${animal?.name || ""}`}
                position="right"
                size="xl"
            >
                <Text c="dimmed" ta="center" p="xl">
                    You don't have permission to view health records.
                </Text>
            </Drawer>
        );
    }

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                title={`Health Records - ${animal?.name || ""}`}
                position="right"
                size="xl"
            >
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

                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            Manage health records for this animal
                        </Text>
                        {canCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setCreateModalOpen(true)}
                            >
                                Create Record
                            </Button>
                        )}
                    </Group>

                    <Paper withBorder p="md" radius="md">
                        <Stack gap="md">
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <TextInput
                                    label="Date From"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.currentTarget.value)
                                    }
                                />
                                <TextInput
                                    label="Date To"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) =>
                                        setDateTo(e.currentTarget.value)
                                    }
                                />
                            </SimpleGrid>
                            <Group justify="flex-end">
                                <Button
                                    variant="default"
                                    onClick={handleClearFilters}
                                >
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleFilter}
                                    loading={isLoading}
                                >
                                    Filter
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>

                    <Paper withBorder radius="md">
                        <ScrollArea>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Cost</Table.Th>
                                        <Table.Th>Next Due Date</Table.Th>
                                        <Table.Th>Record Date</Table.Th>
                                        {canUpdate && (
                                            <Table.Th>Actions</Table.Th>
                                        )}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {isLoading ? (
                                        <Table.Tr>
                                            <Table.Td
                                                colSpan={canUpdate ? 6 : 5}
                                            >
                                                <Group justify="center" p="xl">
                                                    <Loader size="sm" />
                                                    <Text c="dimmed">
                                                        Loading records...
                                                    </Text>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : records.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td
                                                colSpan={canUpdate ? 6 : 5}
                                            >
                                                <Text
                                                    c="dimmed"
                                                    ta="center"
                                                    p="xl"
                                                >
                                                    No health records found.
                                                    Create your first record.
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        records.map((record) => (
                                            <Table.Tr key={record.id}>
                                                <Table.Td>
                                                    {record.recordType}
                                                </Table.Td>
                                                <Table.Td>
                                                    {record.name}
                                                </Table.Td>
                                                <Table.Td>
                                                    {record.cost
                                                        ? `$${typeof record.cost === "string" ? parseFloat(record.cost).toFixed(2) : record.cost.toFixed(2)}`
                                                        : "—"}
                                                </Table.Td>
                                                <Table.Td>
                                                    {record.nextDueDate
                                                        ? formatDate(
                                                              record.nextDueDate
                                                          )
                                                        : "—"}
                                                </Table.Td>
                                                <Table.Td>
                                                    {formatDate(
                                                        record.createdAt
                                                    )}
                                                </Table.Td>
                                                {canUpdate && (
                                                    <Table.Td>
                                                        <Button
                                                            variant="subtle"
                                                            size="xs"
                                                            leftSection={
                                                                <IconEdit
                                                                    size={14}
                                                                />
                                                            }
                                                            onClick={() => {
                                                                setSelectedRecord(
                                                                    record
                                                                );
                                                                setUpdateModalOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Update
                                                        </Button>
                                                    </Table.Td>
                                                )}
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>

                    {pagination.totalPages > 1 && (
                        <Group justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                Showing {records.length} of {pagination.total}{" "}
                                records
                            </Text>
                            <Pagination
                                value={pagination.page}
                                onChange={(page) => {
                                    setPagination((prev) => ({
                                        ...prev,
                                        page,
                                    }));
                                    fetchRecords(page);
                                }}
                                total={pagination.totalPages}
                                size="sm"
                            />
                        </Group>
                    )}
                </Stack>
            </Drawer>

            {canCreate && (
                <HealthRecordModal
                    opened={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                    animal={animal}
                />
            )}

            {canUpdate && selectedRecord && (
                <HealthRecordUpdateModal
                    opened={updateModalOpen}
                    onClose={() => {
                        setUpdateModalOpen(false);
                        setSelectedRecord(null);
                    }}
                    onSubmit={handleUpdate}
                    isSubmitting={isSubmitting}
                    animal={animal}
                    record={selectedRecord}
                />
            )}
        </>
    );
}
