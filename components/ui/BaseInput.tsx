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
    ({ ...props }, ref) => {
        return (
            <TextInput
                ref={ref}
                size="md"
                radius={6}
                {...props}
            />
        );
    }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;

