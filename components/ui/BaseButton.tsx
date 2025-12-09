"use client";

import { Button, type ButtonProps } from "@mantine/core";

export type BaseButtonProps = ButtonProps;

export default function BaseButton(props: BaseButtonProps) {
    const { radius = 6, ...restProps } = props;
    return (
        <Button
            radius={radius}
            {...restProps}
        />
    );
}
