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
            radius={0}
            size="md"
            styles={{
                root: {
                    borderColor: "#e0e0e0",
                    borderWidth: "1px",
                    color: "#424242",
                    backgroundColor: "#ffffff",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    fontSize: "15px",
                    padding: "14px 24px",
                    height: "48px",
                    "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "#bdbdbd",
                        transform: "none",
                        boxShadow: "none",
                    },
                    "&:active": {
                        backgroundColor: "#eeeeee",
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
