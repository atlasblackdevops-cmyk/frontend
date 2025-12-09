"use client";

import { NumberInput, NumberInputProps } from "@mantine/core";
import { forwardRef, useRef, useEffect } from "react";

export interface BaseNumberInputProps extends NumberInputProps {
    // Add any custom props here if needed
}

/**
 * Common Number Input component used across all modules
 * Provides consistent styling and behavior
 */
const BaseNumberInput = forwardRef<HTMLInputElement, BaseNumberInputProps>(
    ({ styles, onFocus, onChange, value, ...props }, ref) => {
        const internalRef = useRef<HTMLInputElement>(null);
        const inputRef = (ref || internalRef) as React.RefObject<HTMLInputElement>;
        const previousValueRef = useRef<string | number | undefined>(value);

        const moveCursorToEnd = (input: HTMLInputElement) => {
            setTimeout(() => {
                if (input && document.activeElement === input) {
                    const length = input.value?.length || 0;
                    input.setSelectionRange(length, length);
                }
            }, 0);
        };

        // Move cursor to end when value changes (e.g., from button clicks)
        useEffect(() => {
            if (value !== previousValueRef.current && inputRef.current) {
                moveCursorToEnd(inputRef.current);
                previousValueRef.current = value;
            }
        }, [value]);

        const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
            // Move cursor to end of input
            moveCursorToEnd(event.currentTarget);
            
            // Call original onFocus if provided
            if (onFocus) {
                onFocus(event);
            }
        };

        const handleChange = (val: string | number) => {
            // Call original onChange if provided
            if (onChange) {
                onChange(val);
            }
        };

        return (
            <NumberInput
                ref={inputRef}
                size="md"
                radius={6}
                onFocus={handleFocus}
                onChange={handleChange}
                value={value}
                {...props}
                styles={{
                    label: {
                        fontSize: "14px",
                    },
                    input: {
                        height: "38px",
                        minHeight: "38px",
                        fontSize: "14px",
                        paddingRight: "36px",
                    },
                    error: {
                        fontSize: "12px",
                    },
                    wrapper: {
                        position: "relative",
                    },
                    controls: {
                        width: "32px",
                        height: "36px",
                        top: "1px",
                        right: "1px",
                        borderLeft: "1px solid var(--mantine-color-gray-3)",
                    },
                    control: {
                        border: "none",
                        height: "18px",
                        minHeight: "18px",
                        "&:not(:disabled):hover": {
                            backgroundColor: "var(--mantine-color-gray-1)",
                        },
                    },
                    ...styles,
                }}
            />
        );
    }
);

BaseNumberInput.displayName = "BaseNumberInput";

export default BaseNumberInput;

