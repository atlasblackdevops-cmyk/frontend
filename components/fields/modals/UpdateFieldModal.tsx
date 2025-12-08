"use client";

import { Modal, Stack, TextInput, Select, NumberInput, Textarea, Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { AddFieldValues, UpdateFieldModalProps } from "../types";
import { SIZE_UNIT_OPTIONS, SOIL_TYPE_OPTIONS } from "../types";

export default function UpdateFieldModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    field,
}: UpdateFieldModalProps) {
    const form = useForm<AddFieldValues>({
        initialValues: {
            fieldName: "",
            fieldSize: "",
            sizeUnit: "acres",
            soilType: "",
            isActive: true,
            notes: "",
        },
        validateInputOnBlur: true,
        validate: {
            fieldName: (value) =>
                value.trim().length < 2
                    ? "Field name must be at least 2 characters"
                    : null,
        },
    });

    useEffect(() => {
        if (field && opened) {
            form.setValues({
                fieldName: field.fieldName,
                fieldSize: field.fieldSize || "",
                sizeUnit: field.sizeUnit || "acres",
                soilType: field.soilType || "",
                isActive: field.isActive,
                notes: field.notes || "",
            });
            form.resetDirty({
                fieldName: field.fieldName,
                fieldSize: field.fieldSize || "",
                sizeUnit: field.sizeUnit || "acres",
                soilType: field.soilType || "",
                isActive: field.isActive,
                notes: field.notes || "",
            });
        }
    }, [field, opened]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues: AddFieldValues = {
            fieldName: values.fieldName.trim(),
            fieldSize: values.fieldSize === "" ? undefined : values.fieldSize,
            sizeUnit: values.sizeUnit || undefined,
            soilType: values.soilType || undefined,
            isActive: values.isActive,
            notes: values.notes?.trim() || undefined,
        };
        await onSubmit(submitValues);
        resetAndClose();
    };

    const submitDisabled =
        isSubmitting ||
        !form.isDirty() ||
        !form.values.fieldName.trim();

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update Field"
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Field Name"
                        placeholder="e.g., North Field, Field A"
                        required
                        {...form.getInputProps("fieldName")}
                    />

                    <Group grow>
                        <NumberInput
                            label="Field Size (Optional)"
                            placeholder="0.00"
                            decimalScale={2}
                            min={0}
                            {...form.getInputProps("fieldSize")}
                        />
                        <Select
                            label="Size Unit"
                            data={SIZE_UNIT_OPTIONS}
                            {...form.getInputProps("sizeUnit")}
                        />
                    </Group>

                    <Select
                        label="Soil Type (Optional)"
                        placeholder="Select soil type"
                        data={SOIL_TYPE_OPTIONS.filter((opt) => opt.value !== "all")}
                        {...form.getInputProps("soilType")}
                    />

                    <Switch
                        label="Active"
                        description="Field is currently active and available for use"
                        {...form.getInputProps("isActive", { type: "checkbox" })}
                    />

                    <Textarea
                        label="Notes (Optional)"
                        placeholder="Additional notes about this field"
                        minRows={3}
                        {...form.getInputProps("notes")}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={resetAndClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting} disabled={submitDisabled}>
                            Update Field
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

