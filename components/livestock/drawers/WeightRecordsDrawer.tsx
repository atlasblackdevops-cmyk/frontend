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
import type { AnimalRecord, WeightRecord } from "../types";
import { formatDate } from "@/lib/livestock/utils";
import {
    getWeightRecords,
    createWeightRecord,
    updateWeightRecord,
} from "@/lib/livestock/api";
import WeightRecordModal from "../modals/WeightRecordModal";
import WeightRecordUpdateModal from "../modals/WeightRecordUpdateModal";

interface WeightRecordsDrawerProps {
    opened: boolean;
    onClose: () => void;
    animal: AnimalRecord | null;
}

export default function WeightRecordsDrawer({
    opened,
    onClose,
    animal,
}: WeightRecordsDrawerProps) {
    const [records, setRecords] = useState<WeightRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<WeightRecord | null>(
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
            const data = await getWeightRecords(animal.id);
            setRecords(data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch weight records"
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
        measuredAt: string;
        weight: number;
        weightUnit: string;
        notes: string;
    }) => {
        if (!animal?.id) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await createWeightRecord(animal.id, {
                measuredAt: values.measuredAt,
                weight: values.weight,
                weightUnit: values.weightUnit,
                notes: values.notes || undefined,
            });
            setSuccessMessage("Weight record created successfully");
            setCreateModalOpen(false);
            await fetchRecords();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to create weight record"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (values: {
        measuredAt: string;
        weight: number;
        weightUnit: string;
        notes: string;
    }) => {
        if (!animal?.id || !selectedRecord) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await updateWeightRecord(animal.id, selectedRecord.id, {
                measuredAt: values.measuredAt,
                weight: values.weight,
                weightUnit: values.weightUnit,
                notes: values.notes || undefined,
            });
            setSuccessMessage("Weight record updated successfully");
            setUpdateModalOpen(false);
            setSelectedRecord(null);
            await fetchRecords();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update weight record"
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
                title={`Weight Records - ${animal?.name || ""}`}
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
                            Manage weight records for this animal
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
                                        <Table.Th>Measured At</Table.Th>
                                        <Table.Th>Weight</Table.Th>
                                        <Table.Th>Unit</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {isLoading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={4}>
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
                                            <Table.Td colSpan={4}>
                                                <Text
                                                    c="dimmed"
                                                    ta="center"
                                                    p="xl"
                                                >
                                                    No weight records found.
                                                    Create your first record.
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        records.map((record) => (
                                            <Table.Tr key={record.id}>
                                                <Table.Td>
                                                    {formatDate(
                                                        record.measuredAt
                                                    )}
                                                </Table.Td>
                                                <Table.Td>{record.weight}</Table.Td>
                                                <Table.Td>
                                                    {record.weightUnit}
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

            <WeightRecordModal
                opened={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
                animal={animal}
            />

            {selectedRecord && (
                <WeightRecordUpdateModal
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

