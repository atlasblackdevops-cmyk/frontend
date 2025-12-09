"use client";

import { Button, Group, Modal, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseInput, BaseTextarea } from "@/components/ui";
import type { AddGroupValues } from "../types";

interface AddGroupModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddGroupValues) => Promise<void>;
    isSubmitting: boolean;
}

export default function AddGroupModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: AddGroupModalProps) {
    const form = useForm<AddGroupValues>({
        initialValues: {
            name: "",
            description: "",
        },
        validate: {
            name: (value) =>
                value.trim().length < 2
                    ? "Group name must be at least 2 characters"
                    : value.trim().length > 100
                      ? "Group name must be less than 100 characters"
                      : null,
            description: (value) =>
                value.trim().length > 500
                    ? "Description must be less than 500 characters"
                    : null,
        },
    });

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Create Animal Group"
            centered
            size="md"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name.trim(),
                        description: values.description.trim(),
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <BaseInput
                        label="Group Name"
                        placeholder="e.g. Cattle Barn 1"
                        required
                        description="Give your group a descriptive name"
                        {...form.getInputProps("name")}
                    />
                    <BaseTextarea
                        label="Description"
                        placeholder="Optional description for this group..."
                        description="Add any additional notes about this group"
                        rows={4}
                        {...form.getInputProps("description")}
                    />
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Create Group
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}



