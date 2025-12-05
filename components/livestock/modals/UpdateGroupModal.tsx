"use client";

import { useEffect } from "react";
import { Button, Group, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { AnimalGroup, UpdateGroupValues } from "../types";

interface UpdateGroupModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: UpdateGroupValues) => Promise<void>;
    isSubmitting: boolean;
    group: AnimalGroup | null;
}

export default function UpdateGroupModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    group,
}: UpdateGroupModalProps) {
    const form = useForm<UpdateGroupValues>({
        initialValues: {
            name: "",
            description: "",
        },
        validate: {
            name: (value) =>
                value && value.trim().length < 2
                    ? "Group name must be at least 2 characters"
                    : value && value.trim().length > 100
                      ? "Group name must be less than 100 characters"
                      : null,
            description: (value) =>
                value && value.trim().length > 500
                    ? "Description must be less than 500 characters"
                    : null,
        },
    });

    // Update form when group changes
    useEffect(() => {
        if (group && opened) {
            form.setValues({
                name: group.name,
                description: group.description || "",
            });
        }
    }, [group, opened]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update Animal Group"
            centered
            size="md"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name?.trim(),
                        description: values.description?.trim() || "",
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <TextInput
                        label="Group Name"
                        placeholder="e.g. Cattle Barn 1"
                        required
                        description="Give your group a descriptive name"
                        {...form.getInputProps("name")}
                    />
                    <Textarea
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
                            Update Group
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

