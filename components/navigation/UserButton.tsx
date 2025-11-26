"use client";

import React from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Avatar, Group, Text, UnstyledButton } from "@mantine/core";
import { useAuth } from "@/stores/use-auth-store";
import classes from "./UserButton.module.css";

export interface UserButtonProps {
    name?: string;
    email?: string;
    avatarSrc?: string;
    onClick?: () => void;
}

export function UserButton({
    name: propName,
    email: propEmail,
    avatarSrc: propAvatarSrc,
    onClick,
}: UserButtonProps) {
    const { userName, userEmail, userProfilePicture } = useAuth();

    // Use props if provided, otherwise fall back to store data, then to defaults
    const name = propName ?? userName ?? "";
    const email = propEmail ?? userEmail ?? "";
    const avatarSrc = propAvatarSrc ?? userProfilePicture ?? null;
    return (
        <UnstyledButton className={classes.user} onClick={onClick}>
            <Group
                justify="space-between"
                wrap="nowrap"
                style={{ width: "100%" }}
            >
                <Group wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                        src={avatarSrc}
                        radius="xl"
                        style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                        <Text
                            size="sm"
                            fw={500}
                            truncate="end"
                            style={{ display: "block" }}
                        >
                            {name}
                        </Text>
                        <Text
                            c="dimmed"
                            size="xs"
                            truncate="end"
                            style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {email}
                        </Text>
                    </div>
                </Group>
                <IconChevronRight
                    size={14}
                    stroke={1.5}
                    style={{ flexShrink: 0 }}
                />
            </Group>
        </UnstyledButton>
    );
}

export default UserButton;
