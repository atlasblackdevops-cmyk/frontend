"use client";

import { Modal, Stack, Select, NumberInput, Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { AddFieldValues, AddFieldModalProps } from "../types";
import { SIZE_UNIT_OPTIONS, SOIL_TYPE_OPTIONS } from "../types";
import { BaseInput, BaseTextarea } from "@/components/ui";

export default function AddFieldModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: AddFieldModalProps) {
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
            title="Add Field"
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <BaseInput
                        label="Field Name"
                        placeholder="e.g., North Field, Field A"
                        key={form.key("fieldName")}
                        {...form.getInputProps("fieldName")}
                    />

                    <Group grow>
                        <NumberInput
                            label="Field Size (Optional)"
                            placeholder="0.00"
                            decimalScale={2}
                            min={0}
                            radius={6}
                            {...form.getInputProps("fieldSize")}
                        />
                        <Select
                            label="Size Unit"
                            data={SIZE_UNIT_OPTIONS}
                            radius={6}
                            {...form.getInputProps("sizeUnit")}
                        />
                    </Group>

                    <Select
                        label="Soil Type (Optional)"
                        placeholder="Select soil type"
                        data={SOIL_TYPE_OPTIONS.filter((opt) => opt.value !== "all")}
                        radius={6}
                        {...form.getInputProps("soilType")}
                    />  

                    <Switch
                        label="Active"
                        description="Field is currently active and available for use"
                        labelPosition="right"
                        styles={{
                            body: { alignItems: "center", cursor: "pointer" },
                            label: { cursor: "pointer" },
                            track: { cursor: "pointer" },
                            thumb: { cursor: "pointer" },
                        }}
                        {...form.getInputProps("isActive", { type: "checkbox" })}
                    />

                    <BaseTextarea
                        label="Notes (Optional)"
                        placeholder="Additional notes about this field"
                        minRows={3}
                        {...form.getInputProps("notes")}
                    />

                    <Group justify="flex-end" gap="sm" mt="md">
                        <Button variant="subtle" onClick={resetAndClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting} disabled={submitDisabled}>
                            Add Field
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

