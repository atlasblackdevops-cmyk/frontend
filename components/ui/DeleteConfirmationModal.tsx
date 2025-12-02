"use client";

import { Modal, Stack, Group, Text, Button } from "@mantine/core";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

interface DeleteConfirmationModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    itemName: string;
    itemType?: string;
    isDeleting?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    opened,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    itemName,
    itemType = "item",
    isDeleting = false,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    message,
}: DeleteConfirmationModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            size="md"
        >
            <Stack gap="md">
                <Group gap="sm">
                    <IconAlertTriangle
                        size={24}
                        color="var(--mantine-color-red-6)"
                    />
                    <Text fw={500} size="lg">
                        {title}
                    </Text>
                </Group>
                <Text c="dimmed">
                    {message ? (
                        message
                    ) : itemName ? (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>{itemName}</strong>? This action cannot be
                            undone.
                        </>
                    ) : (
                        <>
                            Are you sure you want to delete this {itemType}?
                            This action cannot be undone.
                        </>
                    )}
                </Text>
                <Group justify="flex-end" mt="md">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        color="red"
                        onClick={onConfirm}
                        loading={isDeleting}
                        leftSection={<IconTrash size={16} />}
                    >
                        {confirmLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
