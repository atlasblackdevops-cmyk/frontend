"use client";

import { Button, type ButtonProps } from "@mantine/core";
import React from "react";

export type BaseButtonProps = ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function BaseButton(props: BaseButtonProps) {
    const { radius = 6, ...restProps } = props;
    return (
        <Button
            radius={radius}
            {...restProps}
        />
    );
}
