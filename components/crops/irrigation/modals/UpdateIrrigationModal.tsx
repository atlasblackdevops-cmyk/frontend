"use client";

import { Modal, Stack, Select, NumberInput, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { AddIrrigationValues, UpdateIrrigationModalProps } from "../types";
import {
    VOLUME_UNIT_OPTIONS,
    IRRIGATION_METHOD_OPTIONS,
} from "../types";
import { BaseDateInput, BaseTextarea } from "@/components/ui";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export default function UpdateIrrigationModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    irrigation,
}: UpdateIrrigationModalProps) {
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

    const form = useForm<AddIrrigationValues>({
        initialValues: {
            fieldId: "",
            irrigationDate: new Date().toISOString().split("T")[0],
            irrigationMethod: "",
            waterVolume: "",
            volumeUnit: "liters",
            durationMinutes: "",
            cost: "",
            notes: "",
        },
        validateInputOnBlur: true,
        validate: {
            fieldId: (value) => (!value ? "Field is required" : null),
            irrigationDate: (value) => (!value ? "Irrigation date is required" : null),
        },
    });

    useEffect(() => {
        if (irrigation && opened) {
            form.setValues({
                fieldId: irrigation.fieldId,
                irrigationDate: irrigation.irrigationDate,
                irrigationMethod: irrigation.irrigationMethod || "",
                waterVolume: irrigation.waterVolume || "",
                volumeUnit: irrigation.volumeUnit || "liters",
                durationMinutes: irrigation.durationMinutes || "",
                cost: irrigation.cost || "",
                notes: irrigation.notes || "",
            });
            form.resetDirty();
        }
    }, [irrigation, opened]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues: AddIrrigationValues = {
            fieldId: values.fieldId,
            irrigationDate: values.irrigationDate,
            irrigationMethod: values.irrigationMethod || undefined,
            waterVolume: values.waterVolume === "" ? undefined : values.waterVolume,
            volumeUnit: values.volumeUnit || undefined,
            durationMinutes: values.durationMinutes === "" ? undefined : Number(values.durationMinutes),
            cost: values.cost === "" ? undefined : values.cost,
            notes: values.notes?.trim() || undefined,
        };
        await onSubmit(submitValues);
        resetAndClose();
    };

    const submitDisabled =
        isSubmitting ||
        !form.isDirty() ||
        !form.values.fieldId ||
        !form.values.irrigationDate;

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update Irrigation Record"
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
                        label="Irrigation Date"
                        placeholder="Select date"
                        required
                        clearable
                        value={form.values.irrigationDate}
                        onChange={(date) => {
                            form.setFieldValue("irrigationDate", date || "");
                        }}
                        key={form.key("irrigationDate")}
                    />

                    <Select
                        label="Irrigation Method"
                        placeholder="Select method"
                        data={IRRIGATION_METHOD_OPTIONS}
                        {...form.getInputProps("irrigationMethod")}
                    />

                    <Group grow>
                        <TextInput
                            label="Water Volume"
                            placeholder="e.g., 500"
                            radius={6}
                            {...form.getInputProps("waterVolume")}
                        />
                        <Select
                            label="Volume Unit"
                            data={VOLUME_UNIT_OPTIONS}
                            radius={6}
                            {...form.getInputProps("volumeUnit")}
                        />
                    </Group>

                    <NumberInput
                        label="Duration (minutes)"
                        placeholder="e.g., 30"
                        min={1}
                        radius={6}
                        {...form.getInputProps("durationMinutes")}
                    />

                    <TextInput
                        label="Cost (Optional)"
                        placeholder="e.g., 50.00"
                        radius={6}
                        {...form.getInputProps("cost")}
                    />

                    <BaseTextarea
                        label="Notes (Optional)"
                        placeholder="Additional notes about this irrigation"
                        minRows={3}
                        {...form.getInputProps("notes")}
                    />

                    <Group justify="flex-end" gap="sm" mt="md">
                        <Button variant="subtle" onClick={resetAndClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting} disabled={submitDisabled}>
                            Update Irrigation
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
