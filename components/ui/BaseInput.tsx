"use client";

import { TextInput, TextInputProps } from "@mantine/core";
import { forwardRef } from "react";

export interface BaseInputProps extends TextInputProps {
    // Add any custom props here if needed
}

/**
 * Common Input component used across all modules
 * Provides consistent styling and behavior
 */
const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
    ({ styles, ...props }, ref) => {
        return (
            <TextInput
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
                    ...styles,
                }}
                {...props}
            />
        );
    }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;

