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
import type { AnimalRecord, FeedRecord } from "../types";
import { formatDate } from "@/lib/livestock/utils";
import {
    getFeedRecords,
    createFeedRecord,
    updateFeedRecord,
} from "@/lib/livestock/api";
import FeedRecordModal from "../modals/FeedRecordModal";
import FeedRecordUpdateModal from "../modals/FeedRecordUpdateModal";

interface FeedRecordsDrawerProps {
    opened: boolean;
    onClose: () => void;
    animal: AnimalRecord | null;
}

export default function FeedRecordsDrawer({
    opened,
    onClose,
    animal,
}: FeedRecordsDrawerProps) {
    const [records, setRecords] = useState<FeedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<FeedRecord | null>(
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
            const data = await getFeedRecords(animal.id);
            setRecords(data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch feed records"
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
        quantity: number;
        quantityUnit: string;
        feedType: string;
        notes: string;
    }) => {
        if (!animal?.id) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await createFeedRecord(animal.id, {
                quantity: values.quantity,
                quantityUnit: values.quantityUnit,
                feedType: values.feedType,
                notes: values.notes || undefined,
            });
            setSuccessMessage("Feed record created successfully");
            setCreateModalOpen(false);
            await fetchRecords();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to create feed record"
            );
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (values: {
        quantity: number;
        quantityUnit: string;
        feedType: string;
        notes: string;
    }) => {
        if (!animal?.id || !selectedRecord) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await updateFeedRecord(animal.id, selectedRecord.id, {
                quantity: values.quantity,
                quantityUnit: values.quantityUnit,
                feedType: values.feedType,
                notes: values.notes || undefined,
            });
            setSuccessMessage("Feed record updated successfully");
            setUpdateModalOpen(false);
            setSelectedRecord(null);
            await fetchRecords();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update feed record"
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
                title={`Feed Records - ${animal?.name || ""}`}
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
                            Manage feed records for this animal
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
                                        <Table.Th>Quantity</Table.Th>
                                        <Table.Th>Unit</Table.Th>
                                        <Table.Th>Feed Type</Table.Th>
                                        <Table.Th>Date</Table.Th>
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
                                                    No feed records found. Create
                                                    your first record.
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        records.map((record) => (
                                            <Table.Tr key={record.id}>
                                                <Table.Td>
                                                    {record.quantity}
                                                </Table.Td>
                                                <Table.Td>
                                                    {record.quantityUnit}
                                                </Table.Td>
                                                <Table.Td>
                                                    {record.feedType}
                                                </Table.Td>
                                                <Table.Td>
                                                    {formatDate(
                                                        record.createdAt
                                                    )}
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

            <FeedRecordModal
                opened={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
                animal={animal}
            />

            {selectedRecord && (
                <FeedRecordUpdateModal
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

