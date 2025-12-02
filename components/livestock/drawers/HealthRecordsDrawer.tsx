"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Drawer,
    Group,
    Loader,
    Notification,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconEdit, IconPlus, IconX } from "@tabler/icons-react";
import type { AnimalRecord, HealthRecord } from "../types";
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

    const fetchRecords = async () => {
        if (!animal?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getHealthRecords(animal.id);
            setRecords(data);
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
        if (opened && animal?.id) {
            fetchRecords();
        }
    }, [opened, animal?.id]);

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
        if (!animal?.id) return;
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
            await fetchRecords();
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
        if (!animal?.id || !selectedRecord) return;
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
            await fetchRecords();
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
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Create Record
                        </Button>
                    </Group>

                    <Paper withBorder radius="md">
                        <ScrollArea>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Cost</Table.Th>
                                        <Table.Th>Next Due Date</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {isLoading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={5}>
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
                                            <Table.Td colSpan={5}>
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
                                                <Table.Td>{record.name}</Table.Td>
                                                <Table.Td>
                                                    {record.cost
                                                        ? `$${record.cost.toFixed(2)}`
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
                                                    <Button
                                                        variant="subtle"
                                                        size="xs"
                                                        leftSection={
                                                            <IconEdit size={14} />
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
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </Stack>
            </Drawer>

            <HealthRecordModal
                opened={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
                animal={animal}
            />

            {selectedRecord && (
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

