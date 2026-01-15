"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { BaseDateInput, TableFiltersDrawer } from "@/components/ui";
import type { FilterValues, ExpenseCategory } from "../types";
import { getExpenseCategories } from "@/lib/finance/expense/api";

interface ExpenseFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export default function ExpenseFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: ExpenseFiltersDrawerProps) {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        if (opened) {
            setLoadingCategories(true);
            getExpenseCategories()
                .then((data) => setCategories(data))
                .catch(() => setCategories([]))
                .finally(() => setLoadingCategories(false));
        }
    }, [opened]);

    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            categoryId: filters.categoryId,
            expenseDateFrom: filters.expenseDateFrom,
            expenseDateTo: filters.expenseDateTo,
        },
    });

    const handleApply = () => {
        onApplyFilters({
            ...form.values,
            search: filters.search, // Keep search value from parent
        });
        onClose();
    };

    const handleClear = () => {
        form.setValues({
            categoryId: "all",
            expenseDateFrom: "",
            expenseDateTo: "",
        });
        onClearFilters();
    };

    return (
        <TableFiltersDrawer
            opened={opened}
            onClose={onClose}
            onApply={handleApply}
            onClear={handleClear}
        >
            <Select
                label="Category"
                placeholder={loadingCategories ? "Loading categories..." : "All categories"}
                data={[
                    { value: "all", label: "All Categories" },
                    ...categories.map((category) => ({
                        value: category.id,
                        label: category.categoryName,
                    })),
                ]}
                value={form.values.categoryId}
                onChange={(value) => form.setFieldValue("categoryId", value || "all")}
                disabled={loadingCategories}
                searchable
            />

            <BaseDateInput
                label="Expense Date From"
                placeholder="Select start date"
                value={form.values.expenseDateFrom}
                clearable
                onChange={(date) => {
                    form.setFieldValue("expenseDateFrom", date || "");
                }}
            />

            <BaseDateInput
                label="Expense Date To"
                placeholder="Select end date"
                value={form.values.expenseDateTo ? new Date(form.values.expenseDateTo) : null}
                clearable
                onChange={(date) => {
                    form.setFieldValue("expenseDateTo", date || "");
                }}
            />
        </TableFiltersDrawer>
    );
}

