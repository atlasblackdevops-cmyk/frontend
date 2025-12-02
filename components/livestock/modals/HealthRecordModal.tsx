"use client";

import {
    Button,
    Group,
    Modal,
    NumberInput,
    Stack,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { HealthRecordValues, AnimalRecord } from "../types";

interface HealthRecordModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        type: string;
        name: string;
        cost: number | null;
        nextDueDate: string | null;
        description: string | null;
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
}

export default function HealthRecordModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
}: HealthRecordModalProps) {
    const form = useForm<HealthRecordValues>({
        initialValues: {
            type: "",
            name: "",
            cost: "",
            nextDueDate: "",
            description: "",
        },
        validate: {
            type: (value) =>
                value.trim().length === 0 ? "Type is required" : null,
            name: (value) =>
                value.trim().length === 0 ? "Name is required" : null,
            cost: (value) => {
                if (value !== "" && value !== null && value !== undefined) {
                    if (typeof value === "number" && value < 0) {
                        return "Cost must be a positive number";
                    }
                }
                return null;
            },
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
            title={`Health Record - ${animal?.name || ""}`}
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        type: values.type.trim(),
                        name: values.name.trim(),
                        cost:
                            typeof values.cost === "number"
                                ? values.cost
                                : null,
                        nextDueDate: values.nextDueDate || null,
                        description: values.description.trim() || null,
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <TextInput
                        label="Type"
                        placeholder="e.g. Vaccination, Treatment"
                        required
                        {...form.getInputProps("type")}
                    />
                    <TextInput
                        label="Name"
                        placeholder="e.g. Annual Checkup"
                        required
                        {...form.getInputProps("name")}
                    />
                    <NumberInput
                        label="Cost"
                        placeholder="Enter cost"
                        prefix="$"
                        decimalScale={2}
                        {...form.getInputProps("cost")}
                    />
                    <TextInput
                        label="Next due date"
                        type="date"
                        {...form.getInputProps("nextDueDate")}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Enter description"
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
                            Save health record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
