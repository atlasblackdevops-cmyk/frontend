"use client";

import { Button, Group, Modal, NumberInput, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseDateInput, BaseTextarea } from "@/components/ui";
import type { WeightRecordValues, AnimalRecord } from "../types";

interface WeightRecordModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        measuredAt: string;
        weight: number;
        weightUnit: string;
        notes: string;
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
}

const weightUnitOptions = [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
    { value: "g", label: "g" },
];

export default function WeightRecordModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
}: WeightRecordModalProps) {
    const form = useForm<WeightRecordValues>({
        initialValues: {
            measuredAt: "",
            weight: "",
            weightUnit: "",
            notes: "",
        },
        validate: {
            measuredAt: (value) =>
                !value ? "Measured at date is required" : null,
            weight: (value) => {
                if (value === "" || value === null || value === undefined) {
                    return "Weight is required";
                }
                if (typeof value === "number" && value <= 0) {
                    return "Weight must be a positive number";
                }
                return null;
            },
            weightUnit: (value) => (!value ? "Weight unit is required" : null),
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
            title={`Weight Record - ${animal?.name || ""}`}
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        measuredAt: values.measuredAt,
                        weight:
                            typeof values.weight === "number"
                                ? values.weight
                                : 0,
                        weightUnit: values.weightUnit,
                        notes: values.notes.trim(),
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <BaseDateInput
                        label="Measured at (date)"
                        placeholder="Select date"
                        required
                        value={form.values.measuredAt}
                        clearable
                        onChange={(date) => {
                                form.setFieldValue("measuredAt", date ||'');
                        }}
                    />
                    <NumberInput
                        label="Weight"
                        placeholder="Enter weight"
                        decimalScale={2}
                        required
                        {...form.getInputProps("weight")}
                    />
                    <Select
                        label="Weight unit"
                        placeholder="Select unit"
                        data={weightUnitOptions}
                        required
                        {...form.getInputProps("weightUnit")}
                    />
                    <BaseTextarea
                        label="Notes"
                        placeholder="Enter notes (optional)"
                        rows={4}
                        {...form.getInputProps("notes")}
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
                            Save weight record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

