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
    Stack,
    Table,
    Text,
    Badge,
    ActionIcon,
} from "@mantine/core";
import { IconEdit, IconPlus, IconX, IconTrash } from "@tabler/icons-react";
import { BaseDateInput, BaseSelect } from "@/components/ui";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import type { EquipmentRecord, MaintenanceLogRecord, PaginationInfo, MaintenanceFilterValues } from "../types";
import { MAINTENANCE_TYPE_OPTIONS } from "../types";
import { useMaintenanceLogs } from "../hooks";
import AddMaintenanceLogModal from "../modals/AddMaintenanceLogModal";
import UpdateMaintenanceLogModal from "../modals/UpdateMaintenanceLogModal";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: string | null | undefined): string {
  if (!amount) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount));
  } catch {
    return amount;
  }
}

function getMaintenanceTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case "routine":
      return "blue";
    case "repair":
      return "red";
    case "inspection":
      return "green";
    default:
      return "gray";
  }
}

export default function MaintenanceLogsDrawer({
    opened,
    onClose,
    equipment,
    canCreate,
    canUpdate,
    canDelete,
}: {
    opened: boolean;
    onClose: () => void;
    equipment: EquipmentRecord | null;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}) {
    const {
        maintenanceLogs,
        isLoading,
        pagination,
        error: logsError,
        fetchMaintenanceLogs,
        createMaintenanceLog,
        updateMaintenanceLog,
        deleteMaintenanceLog,
        setPagination,
    } = useMaintenanceLogs();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<MaintenanceLogRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filters, setFilters] = useState<MaintenanceFilterValues>({
        maintenanceType: "all",
        maintenanceDateFrom: "",
        maintenanceDateTo: "",
    });

    const fetchLogs = async (page: number = 1) => {
        if (!equipment?.id) return;
        await fetchMaintenanceLogs(page, {
            equipmentId: equipment.id,
            maintenanceType: filters.maintenanceType !== "all" ? filters.maintenanceType : undefined,
            maintenanceDateFrom: filters.maintenanceDateFrom || undefined,
            maintenanceDateTo: filters.maintenanceDateTo || undefined,
        });
    };

    useEffect(() => {
        if (opened && equipment?.id) {
            fetchLogs(1);
        } else if (!opened) {
            setFilters({
                maintenanceType: "all",
                maintenanceDateFrom: "",
                maintenanceDateTo: "",
            });
            setPagination({ ...pagination, page: 1 });
        }
    }, [opened, equipment?.id]);

    useEffect(() => {
        if (opened && equipment?.id) {
            fetchLogs(pagination.page);
        }
    }, [filters, pagination.page]);

    useEffect(() => {
        if (logsError) {
            setError(logsError);
        }
    }, [logsError]);

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
        maintenanceDate: string;
        maintenanceType: string;
        description: string;
        cost?: number;
        performedBy?: string;
        nextMaintenanceDate?: string;
        notes?: string;
    }) => {
        if (!equipment?.id || !canCreate) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await createMaintenanceLog({
                equipmentId: equipment.id,
                ...values,
            });
            if (result.success) {
                setSuccessMessage("Maintenance log created successfully");
                setCreateModalOpen(false);
            } else {
                setError(result.error || "Failed to create maintenance log");
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to create maintenance log"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (values: {
        maintenanceDate?: string;
        maintenanceType?: string;
        description?: string;
        cost?: number;
        performedBy?: string;
        nextMaintenanceDate?: string;
        notes?: string;
    }) => {
        if (!selectedLog || !canUpdate) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await updateMaintenanceLog(selectedLog.id, values);
            if (result.success) {
                setSuccessMessage("Maintenance log updated successfully");
                setUpdateModalOpen(false);
                setSelectedLog(null);
            } else {
                setError(result.error || "Failed to update maintenance log");
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update maintenance log"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (logId: string) => {
        if (!canDelete) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await deleteMaintenanceLog(logId);
            if (result.success) {
                setSuccessMessage("Maintenance log deleted successfully");
            } else {
                setError(result.error || "Failed to delete maintenance log");
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to delete maintenance log"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                title={`Maintenance Logs - ${equipment?.equipmentName || ""}`}
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
                            icon={<IconPlus size={18} />}
                            color="green"
                            title="Success"
                            onClose={() => setSuccessMessage(null)}
                            withCloseButton
                        >
                            {successMessage}
                        </Notification>
                    )}

                    <Group justify="space-between">
                        <Text fw={600} size="lg">
                            Maintenance History
                        </Text>
                        {canCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setCreateModalOpen(true)}
                            >
                                Add Log
                            </Button>
                        )}
                    </Group>

                    <Paper withBorder p="md">
                        <Stack gap="md">
                            <Group>
                                <BaseSelect
                                    label="Maintenance Type"
                                    placeholder="All types"
                                    data={MAINTENANCE_TYPE_OPTIONS}
                                    value={filters.maintenanceType}
                                    onChange={(value) =>
                                        setFilters({ ...filters, maintenanceType: value || "all" })
                                    }
                                    style={{ flex: 1 }}
                                />
                                <BaseDateInput
                                    label="From Date"
                                    placeholder="Select start date"
                                    clearable
                                    value={filters.maintenanceDateFrom ? new Date(filters.maintenanceDateFrom) : null}
                                    onChange={(value) => {
                                        if (value) {
                                            const date = typeof value === 'string' ? new Date(value) : (value as unknown as Date);
                                            setFilters({
                                                ...filters,
                                                maintenanceDateFrom: date.toISOString().split('T')[0],
                                            });
                                        } else {
                                            setFilters({
                                                ...filters,
                                                maintenanceDateFrom: "",
                                            });
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                />
                                <BaseDateInput
                                    label="To Date"
                                    placeholder="Select end date"
                                    clearable
                                    value={filters.maintenanceDateTo ? new Date(filters.maintenanceDateTo) : null}
                                    onChange={(value) => {
                                        if (value) {
                                            const date = typeof value === 'string' ? new Date(value) : (value as unknown as Date);
                                            setFilters({
                                                ...filters,
                                                maintenanceDateTo: date.toISOString().split('T')[0],
                                            });
                                        } else {
                                            setFilters({
                                                ...filters,
                                                maintenanceDateTo: "",
                                            });
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    {isLoading ? (
                        <Group justify="center" p="xl">
                            <Loader />
                        </Group>
                    ) : maintenanceLogs.length === 0 ? (
                        <Paper p="xl" withBorder>
                            <Text c="dimmed" ta="center">
                                No maintenance logs found
                            </Text>
                        </Paper>
                    ) : (
                        <>
                            <ScrollArea>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Description</Table.Th>
                                            <Table.Th>Cost</Table.Th>
                                            <Table.Th>Performed By</Table.Th>
                                            <Table.Th>Next Service</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {maintenanceLogs.map((log) => (
                                            <Table.Tr key={log.id}>
                                                <Table.Td>{formatDate(log.maintenanceDate)}</Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        variant="light"
                                                        color={getMaintenanceTypeColor(log.maintenanceType)}
                                                    >
                                                        {log.maintenanceType}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" lineClamp={2}>
                                                        {log.description}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>{formatCurrency(log.cost)}</Table.Td>
                                                <Table.Td>{log.performedBy || "-"}</Table.Td>
                                                <Table.Td>{formatDate(log.nextMaintenanceDate)}</Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        {canUpdate && (
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => {
                                                                    setSelectedLog(log);
                                                                    setUpdateModalOpen(true);
                                                                }}
                                                            >
                                                                <IconEdit size={16} />
                                                            </ActionIcon>
                                                        )}
                                                        {canDelete && (
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="red"
                                                                onClick={() => handleDelete(log.id)}
                                                            >
                                                                <IconTrash size={16} />
                                                            </ActionIcon>
                                                        )}
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>

                            {pagination.totalPages > 1 && (
                                <Group justify="center">
                                    <Pagination
                                        value={pagination.page}
                                        onChange={(page) => {
                                            setPagination({ ...pagination, page });
                                        }}
                                        total={pagination.totalPages}
                                    />
                                </Group>
                            )}
                        </>
                    )}
                </Stack>
            </Drawer>

            <AddMaintenanceLogModal
                opened={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreate}
                equipment={equipment}
                isSubmitting={isSubmitting}
            />

            <UpdateMaintenanceLogModal
                opened={updateModalOpen}
                onClose={() => {
                    setUpdateModalOpen(false);
                    setSelectedLog(null);
                }}
                onSubmit={handleUpdate}
                maintenanceLog={selectedLog}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

