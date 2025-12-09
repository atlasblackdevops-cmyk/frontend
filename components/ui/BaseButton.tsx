"use client";

import { Button, type ButtonProps } from "@mantine/core";
import { forwardRef } from "react";

export interface BaseButtonProps extends ButtonProps {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
}

const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ radius = 6, ...props }, ref) => {
        return <Button ref={ref} radius={radius} {...props} />;
    }
);

BaseButton.displayName = "BaseButton";

export default BaseButton;
