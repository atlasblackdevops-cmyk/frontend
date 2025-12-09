"use client";

import { Textarea, TextareaProps } from "@mantine/core";
import { forwardRef } from "react";

export interface BaseTextareaProps extends TextareaProps {
    // Add any custom props here if needed
}

/**
 * Common Textarea component used across all modules
 * Provides consistent styling and behavior
 */
const BaseTextarea = forwardRef<HTMLTextAreaElement, BaseTextareaProps>(
    ({ ...props }, ref) => {
        return (
            <Textarea
                ref={ref}
                size="md"
                radius={6}
                {...props}
            />
        );
    }
);

BaseTextarea.displayName = "BaseTextarea";

export default BaseTextarea;

