"use client";

import { useEffect } from "react";
import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { FeedRecordValues, AnimalRecord, FeedRecord } from "../types";

interface FeedRecordUpdateModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        quantity: number;
        quantityUnit: string;
        feedType: string;
        notes: string;
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
    record: FeedRecord;
}

const quantityUnitOptions = [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
    { value: "g", label: "g" },
    { value: "oz", label: "oz" },
];

export default function FeedRecordUpdateModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
    record,
}: FeedRecordUpdateModalProps) {
    const form = useForm<FeedRecordValues>({
        initialValues: {
            quantity: "",
            quantityUnit: "",
            feedType: "",
            notes: "",
        },
        validate: {
            quantity: (value) => {
                if (value === "" || value === null || value === undefined) {
                    return "Quantity is required";
                }
                if (typeof value === "number" && value <= 0) {
                    return "Quantity must be a positive number";
                }
                return null;
            },
            quantityUnit: (value) =>
                !value ? "Quantity unit is required" : null,
            feedType: (value) => (!value ? "Feed type is required" : null),
        },
    });

    useEffect(() => {
        if (opened && record) {
            form.setValues({
                quantity: typeof record.quantity === "string" 
                    ? (record.quantity === "" ? "" : Number(record.quantity))
                    : record.quantity,
                quantityUnit: record.quantityUnit,
                feedType: record.feedType,
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
            title={`Update Feed Record - ${animal?.name || ""}`}
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        quantity:
                            typeof values.quantity === "number"
                                ? values.quantity
                                : 0,
                        quantityUnit: values.quantityUnit,
                        feedType: values.feedType.trim(),
                        notes: values.notes.trim(),
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <NumberInput
                        label="Quantity"
                        placeholder="Enter quantity"
                        decimalScale={2}
                        required
                        {...form.getInputProps("quantity")}
                    />
                    <Select
                        label="Quantity unit"
                        placeholder="Select unit"
                        data={quantityUnitOptions}
                        required
                        {...form.getInputProps("quantityUnit")}
                    />
                    <TextInput
                        label="Feed type"
                        placeholder="e.g. Hay, Grain, Pellets"
                        required
                        {...form.getInputProps("feedType")}
                    />
                    <Textarea
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
                            Update feed record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

