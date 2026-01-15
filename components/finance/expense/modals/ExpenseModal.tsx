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
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type {
    AddExpenseValues,
    ExpenseModalProps,
    ExpenseRecord,
    ExpenseCategory,
} from "../types";
import { CURRENCY_OPTIONS, PAYMENT_METHOD_OPTIONS } from "../types";
import { getExpenseCategories } from "@/lib/finance/expense/api";

const BASE_VALUES: AddExpenseValues = {
    categoryId: "",
    otherCategoryName: "",
    expenseDate: "",
    amount: "",
    currencyType: "USD",
    vendor: "",
    description: "",
    paymentMethod: "",
};

const mapExpenseToValues = (expense: ExpenseRecord): AddExpenseValues => ({
    categoryId: expense.categoryId || "",
    otherCategoryName: expense.otherCategoryName || "",
    expenseDate: expense.expenseDate,
    amount: expense.amount,
    currencyType: expense.currencyType || "USD",
    vendor: expense.vendor || "",
    description: expense.description || "",
    paymentMethod: expense.paymentMethod || "",
});

const normalizeSubmitValues = (values: AddExpenseValues): AddExpenseValues => {
    const normalized: any = {
        expenseDate: values.expenseDate,
        amount:
            typeof values.amount === "number"
                ? values.amount
                : parseFloat(values.amount as any) || 0,
        currencyType: values.currencyType || "USD",
    };

    if (values.categoryId) {
        normalized.categoryId = values.categoryId;
    }
    if (values.otherCategoryName?.trim()) {
        normalized.otherCategoryName = values.otherCategoryName.trim();
    }
    if (values.vendor?.trim()) {
        normalized.vendor = values.vendor.trim();
    }
    if (values.description?.trim()) {
        normalized.description = values.description.trim();
    }
    if (values.paymentMethod?.trim()) {
        normalized.paymentMethod = values.paymentMethod.trim();
    }

    return normalized;
};

export default function ExpenseModal({
    mode,
    expense,
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: ExpenseModalProps) {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [useOtherCategory, setUseOtherCategory] = useState(false);

    useEffect(() => {
        if (opened) {
            setLoadingCategories(true);
            getExpenseCategories()
                .then((data) => setCategories(data))
                .catch(() => setCategories([]))
                .finally(() => setLoadingCategories(false));
        }
    }, [opened]);

    const form = useForm<AddExpenseValues>({
        initialValues: BASE_VALUES,
        validateInputOnBlur: true,
        validate: {
            expenseDate: (value) =>
                !value ? "Expense date is required" : null,
            amount: (value) => {
                if (value === "" || value === null || value === undefined) {
                    return "Amount is required";
                }
                const numValue =
                    typeof value === "number"
                        ? value
                        : parseFloat(value as any);
                if (isNaN(numValue) || numValue <= 0) {
                    return "Amount must be greater than 0";
                }
                return null;
            },
            currencyType: (value) => (!value ? "Currency is required" : null),
            categoryId: (value, values) => {
                if (!useOtherCategory && !value && !values.otherCategoryName) {
                    return "Category is required";
                }
                return null;
            },
            otherCategoryName: (value, values) => {
                if (useOtherCategory && !value?.trim()) {
                    return "Other category name is required";
                }
                if (!useOtherCategory && !values.categoryId && !value) {
                    return null; // Will be caught by categoryId validation
                }
                return null;
            },
        },
    });

    const title = mode === "create" ? "Add Expense" : "Update Expense";
    const submitLabel = mode === "create" ? "Add Expense" : "Update Expense";

    // Set form values when modal opens
    useEffect(() => {
        if (!opened) {
            setUseOtherCategory(false);
            return;
        }

        if (mode === "create") {
            form.setValues(BASE_VALUES);
            form.resetDirty(BASE_VALUES);
            setUseOtherCategory(false);
        }
        // For update mode, wait for categories to load before setting values
    }, [mode, opened]);

    // Set form values for update mode after categories are loaded
    useEffect(() => {
        if (!opened || mode !== "update" || !expense) return;

        // Wait for categories to load
        if (loadingCategories || categories.length === 0) return;

        const mapped = mapExpenseToValues(expense);
        form.setValues(mapped);
        form.resetDirty(mapped);
        setUseOtherCategory(!!expense.otherCategoryName && !expense.categoryId);
    }, [mode, expense, opened, loadingCategories, categories.length]);

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues = normalizeSubmitValues(values);
        await onSubmit(submitValues);
        onClose();
    };

    const handleCategoryChange = (value: string | null) => {
        form.setFieldValue("categoryId", value || "");
        if (value) {
            setUseOtherCategory(false);
            form.setFieldValue("otherCategoryName", "");
        }
    };

    const handleUseOtherCategory = () => {
        setUseOtherCategory(true);
        form.setFieldValue("categoryId", "");
    };

    // Disable submit when unchanged or required fields missing
    const requiredFilled =
        !!form.values.expenseDate &&
        !!form.values.amount &&
        (useOtherCategory
            ? !!form.values.otherCategoryName?.trim()
            : !!form.values.categoryId);
    const submitDisabled =
        isSubmitting ||
        (!form.isDirty() && mode === "update") ||
        !requiredFilled;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            size="lg"
        >
            <ScrollArea.Autosize mah={500}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Select
                            label="Category"
                            placeholder={
                                loadingCategories
                                    ? "Loading categories..."
                                    : "Select category or use other"
                            }
                            data={[
                                ...categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.categoryName,
                                })),
                                { value: "__other__", label: "Other (Custom)" },
                            ]}
                            value={
                                useOtherCategory
                                    ? "__other__"
                                    : form.values.categoryId || null
                            }
                            onChange={(value) => {
                                if (value === "__other__") {
                                    handleUseOtherCategory();
                                } else {
                                    handleCategoryChange(value);
                                }
                            }}
                            disabled={loadingCategories}
                            searchable
                            clearable={!useOtherCategory}
                        />

                        {useOtherCategory && (
                            <BaseInput
                                label="Other Category Name"
                                placeholder="Enter custom category name"
                                {...form.getInputProps("otherCategoryName")}
                            />
                        )}

                        <BaseDateInput
                            label="Expense Date"
                            placeholder="Select date"
                            clearable
                            value={form.values.expenseDate}
                            onChange={(date) => {
                                form.setFieldValue("expenseDate", date || "");
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
                            label="Vendor (Optional)"
                            placeholder="Enter vendor name"
                            {...form.getInputProps("vendor")}
                        />

                        <Select
                            label="Payment Method (Optional)"
                            placeholder="Select payment method"
                            data={PAYMENT_METHOD_OPTIONS}
                            searchable
                            clearable
                            {...form.getInputProps("paymentMethod")}
                        />

                        <BaseTextarea
                            label="Description (Optional)"
                            placeholder="Additional notes about this expense"
                            minRows={3}
                            {...form.getInputProps("description")}
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
