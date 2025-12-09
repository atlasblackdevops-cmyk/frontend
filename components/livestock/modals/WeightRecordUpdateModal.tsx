"use client";

import { useEffect } from "react";
import { Button, Group, Modal, NumberInput, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseDateInput, BaseTextarea } from "@/components/ui";
import type { WeightRecordValues, AnimalRecord, WeightRecord } from "../types";

interface WeightRecordUpdateModalProps {
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
    record: WeightRecord;
}

const weightUnitOptions = [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
    { value: "g", label: "g" },
];

export default function WeightRecordUpdateModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
    record,
}: WeightRecordUpdateModalProps) {
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

    useEffect(() => {
        if (opened && record) {
            const measuredAtDate = new Date(record.measuredAt);
            form.setValues({
                measuredAt: measuredAtDate.toISOString().split("T")[0],
                weight: typeof record.weight === "string" 
                    ? (record.weight === "" ? "" : Number(record.weight))
                    : record.weight,
                weightUnit: record.weightUnit,
                notes: record.notes || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, record?.id]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title={`Update Weight Record - ${animal?.name || ""}`}
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
                        value={form.values.measuredAt ? new Date(form.values.measuredAt) : null}
                        onChange={(date) => {
                            if (date && typeof date === 'object' && 'toISOString' in date) {
                                form.setFieldValue("measuredAt", (date as Date).toISOString().split('T')[0]);
                            } else {
                                form.setFieldValue("measuredAt", "");
                            }
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
                            Update weight record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

