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
    ({ ...props }, ref) => {
        return (
            <DateInput
                ref={ref}
                size="md"
                radius={6}
                {...props}
            />
        );
    }
);

BaseDateInput.displayName = "BaseDateInput";

export default BaseDateInput;

