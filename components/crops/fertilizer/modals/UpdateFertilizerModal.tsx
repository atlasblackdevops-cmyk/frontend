"use client";

import { Modal, Stack, Select, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { UpdateFertilizerModalProps, AddFertilizerValues } from "../types";
import {
    QUANTITY_UNIT_OPTIONS,
    FERTILIZER_TYPE_OPTIONS,
    APPLICATION_METHOD_OPTIONS,
} from "../types";
import { BaseDateInput, BaseTextarea } from "@/components/ui";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export default function UpdateFertilizerModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    fertilizer,
}: UpdateFertilizerModalProps) {
    const [fields, setFields] = useState<FieldRecord[]>([]);
    const [loadingFields, setLoadingFields] = useState(false);

    useEffect(() => {
        if (opened) {
            setLoadingFields(true);
            getActiveFields()
                .then((data) => setFields(data))
                .catch(() => setFields([]))
                .finally(() => setLoadingFields(false));
        }
    }, [opened]);

    const form = useForm<AddFertilizerValues>({
        initialValues: {
            fieldId: "",
            applicationDate: "",
            fertilizerType: "",
            quantity: "",
            quantityUnit: "kg",
            applicationMethod: "",
            notes: "",
            cost: "",
        },
        validateInputOnBlur: true,
        validate: {
            fieldId: (value) => (!value ? "Field is required" : null),
            applicationDate: (value) => (!value ? "Application date is required" : null),
            fertilizerType: (value) => {
                if (!value || value.trim() === "") {
                    return "Fertilizer type is required";
                }
                return null;
            },
            quantity: (value) => {
                if (!value || value.trim() === "") {
                    return "Quantity is required";
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                    return "Quantity must be a positive number";
                }
                return null;
            },
            quantityUnit: (value) => (!value ? "Quantity unit is required" : null),
            cost: (value) => {
                if (!value || value.trim() === "") {
                    return "Cost is required";
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                    return "Cost must be a positive number";
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (fertilizer && opened) {
            form.setValues({
                fieldId: fertilizer.fieldId,
                applicationDate: fertilizer.applicationDate || "",
                fertilizerType: fertilizer.fertilizerType || "",
                quantity: fertilizer.quantity || "",
                quantityUnit: fertilizer.quantityUnit || "kg",
                applicationMethod: fertilizer.applicationMethod || "",
                notes: fertilizer.notes || "",
                cost: fertilizer.cost || "",
            });
            form.resetDirty({
                fieldId: fertilizer.fieldId,
                applicationDate: fertilizer.applicationDate || "",
                fertilizerType: fertilizer.fertilizerType || "",
                quantity: fertilizer.quantity || "",
                quantityUnit: fertilizer.quantityUnit || "kg",
                applicationMethod: fertilizer.applicationMethod || "",
                notes: fertilizer.notes || "",
                cost: fertilizer.cost || "",
            });
        }
    }, [fertilizer, opened]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues: AddFertilizerValues = {
            fieldId: values.fieldId,
            applicationDate: values.applicationDate,
            fertilizerType: values.fertilizerType || "",
            quantity: values.quantity || "",
            quantityUnit: values.quantityUnit || "",
            applicationMethod: values.applicationMethod || undefined,
            cost: values.cost || "",
            notes: values.notes?.trim() || undefined,
        };
        await onSubmit(submitValues);
        resetAndClose();
    };

    const submitDisabled =
        isSubmitting ||
        !form.isDirty() ||
        !form.values.fieldId ||
        !form.values.applicationDate ||
        !form.values.fertilizerType ||
        !form.values.quantity ||
        !form.values.quantityUnit ||
        !form.values.cost ||
        !!form.errors.quantity ||
        !!form.errors.cost;

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update Fertilizer Record"
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <Select
                        label="Field"
                        placeholder="Select a field"
                        data={fields.map((field) => ({
                            value: field.id,
                            label: field.fieldName,
                        }))}
                        disabled={loadingFields}
                        searchable
                        required
                        {...form.getInputProps("fieldId")}
                    />

                    <BaseDateInput
                        label="Application Date"
                        placeholder="Select date"
                        required
                        clearable
                        value={form.values.applicationDate}
                        onChange={(date) => {
                            form.setFieldValue("applicationDate", date || "");
                        }}
                        key={form.key("applicationDate")}
                    />

                    <Select
                        label="Fertilizer Type"
                        placeholder="Select type"
                        data={FERTILIZER_TYPE_OPTIONS}
                        searchable
                        required
                        {...form.getInputProps("fertilizerType")}
                    />

                    <Group grow>
                        <TextInput
                            label="Quantity"
                            placeholder="e.g., 50"
                            required
                            {...form.getInputProps("quantity")}
                        />
                        <Select
                            label="Quantity Unit"
                            placeholder="Select unit"
                            data={QUANTITY_UNIT_OPTIONS}
                            required
                            {...form.getInputProps("quantityUnit")}
                        />
                    </Group>

                    <Select
                        label="Application Method (Optional)"
                        placeholder="Select method"
                        data={APPLICATION_METHOD_OPTIONS}
                        clearable
                        {...form.getInputProps("applicationMethod")}
                    />

                    <TextInput
                        label="Cost"
                        placeholder="e.g., 150.00"
                        required
                        {...form.getInputProps("cost")}
                    />

                    <BaseTextarea
                        label="Notes (Optional)"
                        placeholder="Additional notes about this fertilizer application"
                        minRows={3}
                        {...form.getInputProps("notes")}
                    />

                    <Group justify="flex-end" gap="sm" mt="md">
                        <Button variant="subtle" onClick={resetAndClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting} disabled={submitDisabled}>
                            Update Fertilizer
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

