"use client";

import { DateInput, DateInputProps } from "@mantine/dates";
import { forwardRef } from "react";

export interface BaseDateInputProps extends DateInputProps {
    // Add any custom props here if needed
}

/**
 * Common Date Input component used across all modules
 * Provides consistent styling and behavior
 */
const BaseDateInput = forwardRef<HTMLInputElement, BaseDateInputProps>(
    ({ styles, ...props }, ref) => {
        return (
            <DateInput
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
                    day: {
                        fontSize: "14px",
                    },
                    ...styles,
                }}
                {...props}
            />
        );
    }
);

BaseDateInput.displayName = "BaseDateInput";

export default BaseDateInput;

