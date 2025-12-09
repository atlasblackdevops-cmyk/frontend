"use client";

import { Select, SelectProps } from "@mantine/core";
import { forwardRef } from "react";

export interface BaseSelectProps extends SelectProps {
    // Add any custom props here if needed
}

/**
 * Common Select component used across all modules
 * Provides consistent styling and behavior
 */
const BaseSelect = forwardRef<HTMLInputElement, BaseSelectProps>(
    ({ styles, ...props }, ref) => {
        return (
            <Select
                ref={ref}
                size="md"
                radius={6}
                styles={{
                    label: {
                        fontSize: "14px",
                    },
                    input: {
                        height: "38px",
                        minHeight: "38px",
                        fontSize: "14px",
                    },
                    error: {
                        fontSize: "12px",
                    },
                    dropdown: {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                    option: {
                        fontSize: "14px",
                    },
                    ...styles,
                }}
                {...props}
            />
        );
    }
);

BaseSelect.displayName = "BaseSelect";

export default BaseSelect;

