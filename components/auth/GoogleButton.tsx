"use client";

import React from "react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import { Button, ButtonProps, Group } from "@mantine/core";

interface GoogleButtonProps extends ButtonProps {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function GoogleButton({
    children,
    onClick,
    ...props
}: GoogleButtonProps) {
    return (
        <Button
            variant="outline"
            leftSection={<IconBrandGoogle size={18} />}
            onClick={(e) => {
                onClick?.(e);
                if (!e.isDefaultPrevented()) {
                    void signIn("google", {
                        callbackUrl: "/login",
                        prompt: "consent",
                        max_age: 300,
                    });
                }
            }}
            radius="xl"
            styles={{
                root: {
                    borderColor: "var(--mantine-color-gray-3)",
                    borderWidth: "1.5px",
                    color: "var(--mantine-color-dark-7)",
                    backgroundColor: "white",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    fontSize: "var(--mantine-font-size-sm)",
                    padding: "8px 16px",
                    "@media (minWidth: 768px)": {
                        fontSize: "var(--mantine-font-size-md)",
                        padding: "10px 20px",
                    },
                    "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "#4caf50",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    },
                },
            }}
            {...props}
        >
            <Group gap="xs" align="center" wrap="nowrap">
                {children}
            </Group>
        </Button>
    );
}
