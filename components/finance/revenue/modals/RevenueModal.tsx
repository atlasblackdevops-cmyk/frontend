"use client";

import { BaseDateInput, BaseInput, BaseTextarea } from "@/components/ui";
import {
    Button,
    Group,
    Modal,
    NumberInput,
    ScrollArea,
    Select,
    Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type {
    AddRevenueValues,
    RevenueModalProps,
    RevenueRecord,
} from "../types";
import {
    CURRENCY_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    QUANTITY_UNIT_OPTIONS,
} from "../types";

const BASE_VALUES: AddRevenueValues = {
    revenueDate: "",
    amount: "",
    currencyType: "USD",
    buyerName: "",
    productSold: "",
    quantity: "",
    quantityUnit: "",
    paymentMethod: "",
    notes: "",
};

const mapRevenueToValues = (revenue: RevenueRecord): AddRevenueValues => ({
    revenueDate: revenue.revenueDate,
    amount: revenue.amount,
    currencyType: revenue.currencyType || "USD",
    buyerName: revenue.buyerName || "",
    productSold: revenue.productSold || "",
    quantity: revenue.quantity || "",
    quantityUnit: revenue.quantityUnit || "",
    paymentMethod: revenue.paymentMethod || "",
    notes: revenue.notes || "",
});

const normalizeSubmitValues = (
    values: AddRevenueValues
): AddRevenueValues => {
    const normalized: any = {
        revenueDate: values.revenueDate,
        amount: typeof values.amount === "number" ? values.amount : parseFloat(values.amount as any) || 0,
        currencyType: values.currencyType || "USD",
    };

    if (values.buyerName?.trim()) {
        normalized.buyerName = values.buyerName.trim();
    }
    if (values.productSold?.trim()) {
        normalized.productSold = values.productSold.trim();
    }
    if (values.quantity !== "" && values.quantity !== null && values.quantity !== undefined) {
        const qtyValue = typeof values.quantity === "number" ? values.quantity : parseFloat(values.quantity as any);
        if (!isNaN(qtyValue) && qtyValue > 0) {
            normalized.quantity = qtyValue;
        }
    }
    if (values.quantityUnit?.trim()) {
        normalized.quantityUnit = values.quantityUnit.trim();
    }
    if (values.paymentMethod?.trim()) {
        normalized.paymentMethod = values.paymentMethod.trim();
    }
    if (values.notes?.trim()) {
        normalized.notes = values.notes.trim();
    }

    return normalized;
};

export default function RevenueModal({
    mode,
    revenue,
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: RevenueModalProps) {
    const form = useForm<AddRevenueValues>({
        initialValues: BASE_VALUES,
        validateInputOnBlur: true,
        validate: {
            revenueDate: (value) => (!value ? "Revenue date is required" : null),
            amount: (value) => {
                if (value === "" || value === null || value === undefined) {
                    return "Amount is required";
                }
                const numValue = typeof value === "number" ? value : parseFloat(value as any);
                if (isNaN(numValue) || numValue <= 0) {
                    return "Amount must be greater than 0";
                }
                return null;
            },
            currencyType: (value) => (!value ? "Currency is required" : null),
        },
    });

    const title =
        mode === "create" ? "Add Revenue" : "Update Revenue";
    const submitLabel = mode === "create" ? "Add Revenue" : "Update Revenue";

    useEffect(() => {
        if (!opened) return;

        if (mode === "update" && revenue) {
            const mapped = mapRevenueToValues(revenue);
            form.setValues(mapped);
            form.resetDirty(mapped);
        } else if (mode === "create") {
            form.setValues(BASE_VALUES);
            form.resetDirty(BASE_VALUES);
        }
    }, [mode, revenue?.id, opened]);

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues = normalizeSubmitValues(values);
        await onSubmit(submitValues);
        onClose();
    };

    // Disable submit when unchanged or required fields missing
    const requiredFilled =
        !!form.values.revenueDate &&
        !!form.values.amount;
    const submitDisabled = isSubmitting || (!form.isDirty() && mode === "update") || !requiredFilled;

    return (
        <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
            <ScrollArea.Autosize mah={500}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <BaseDateInput
                            label="Revenue Date"
                            placeholder="Select date"
                            clearable
                            value={form.values.revenueDate}
                            onChange={(date) => {
                                form.setFieldValue("revenueDate", date || "");
                            }}
                        />

                        <Group grow>
                            <NumberInput
                                label="Amount"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                prefix={
                                    form.values.currencyType === "USD"
                                        ? "$"
                                        : form.values.currencyType || "USD"
                                }
                                key={form.key("amount")}
                                {...form.getInputProps("amount")}
                            />
                            <Select
                                label="Currency"
                                data={CURRENCY_OPTIONS}
                                searchable
                                key={form.key("currencyType")}
                                {...form.getInputProps("currencyType")}
                            />
                        </Group>

                        <BaseInput
                            label="Buyer Name (Optional)"
                            placeholder="Enter buyer name"
                            {...form.getInputProps("buyerName")}
                        />

                        <BaseInput
                            label="Product Sold (Optional)"
                            placeholder="Enter product name"
                            {...form.getInputProps("productSold")}
                        />

                        <Group grow>
                            <NumberInput
                                label="Quantity (Optional)"
                                placeholder="0.00"
                                decimalScale={2}
                                min={0}
                                key={form.key("quantity")}
                                {...form.getInputProps("quantity")}
                            />
                            <Select
                                label="Quantity Unit (Optional)"
                                placeholder="Select unit"
                                data={QUANTITY_UNIT_OPTIONS}
                                searchable
                                clearable
                                {...form.getInputProps("quantityUnit")}
                            />
                        </Group>

                        <Select
                            label="Payment Method (Optional)"
                            placeholder="Select payment method"
                            data={PAYMENT_METHOD_OPTIONS}
                            searchable
                            clearable
                            {...form.getInputProps("paymentMethod")}
                        />

                        <BaseTextarea
                            label="Notes (Optional)"
                            placeholder="Additional notes about this revenue"
                            minRows={3}
                            {...form.getInputProps("notes")}
                        />
                    </Stack>
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={submitDisabled}
                        >
                            {submitLabel}
                        </Button>
                    </Group>
                </form>
            </ScrollArea.Autosize>
        </Modal>
    );
}

