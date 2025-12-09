"use client";

import { PasswordInput, PasswordInputProps } from "@mantine/core";
import { forwardRef } from "react";

export interface BasePasswordInputProps extends PasswordInputProps {
    // Add any custom props here if needed
}

/**
 * Common Password Input component used across all modules
 * Provides consistent styling and behavior
 */
const BasePasswordInput = forwardRef<HTMLInputElement, BasePasswordInputProps>(
    ({ styles, ...props }, ref) => {
        return (
            <PasswordInput
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

BasePasswordInput.displayName = "BasePasswordInput";

export default BasePasswordInput;

