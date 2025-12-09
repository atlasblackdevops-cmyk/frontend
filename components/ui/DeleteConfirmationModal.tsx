"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { ActionIcon, Modal, Stack, Group, Text, Button, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconTrash, IconX } from "@tabler/icons-react";

interface DeleteConfirmationModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    subtitle?: ReactNode;
    itemName?: string;
    itemType?: string;
    isDeleting?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: string;
    confirmIcon?: ReactNode;
    message?: string; // kept for backward compatibility
}

export default function DeleteConfirmationModal({
    opened,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    subtitle,
    itemName,
    itemType = "item",
    isDeleting = false,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    confirmColor = "red",
    confirmIcon,
    message,
}: DeleteConfirmationModalProps) {
    const resolvedSubtitle = useMemo(() => {
        if (subtitle) return subtitle;
        if (message) return message;
        if (itemName) {
            return (
                <>
                    Are you sure you want to delete <strong>{itemName}</strong>?
                    This action cannot be undone.
                </>
            );
        }
        return (
            <>
                Are you sure you want to delete this {itemType}? This action
                cannot be undone.
            </>
        );
    }, [subtitle, message, itemName, itemType]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="md"
            withCloseButton={false}
        >
            <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" align="center" wrap="nowrap">
                        <ThemeIcon size={44} color="red" variant="light" radius="md">
                            <IconAlertTriangle size={22} />
                        </ThemeIcon>
                        <Text fw={600} size="lg">
                            {title}
                        </Text>
                    </Group>
                    <ActionIcon
                        variant="subtle"
                        color="dark"
                        aria-label="Close"
                        onClick={onClose}
                        size="md"
                    >
                        <IconX size={20} />
                    </ActionIcon>
                </Group>
                        <Text c="dimmed" size="sm">
                            {resolvedSubtitle}
                        </Text>
                <Group justify="flex-end" gap="sm" mt="md">
                    <Button variant="default" onClick={onClose} disabled={isDeleting}>
                        {cancelLabel}
                    </Button>
                    <Button
                        color={confirmColor}
                        onClick={onConfirm}
                        loading={isDeleting}
                        leftSection={confirmIcon ?? <IconTrash size={16} />}
                    >
                        {confirmLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
