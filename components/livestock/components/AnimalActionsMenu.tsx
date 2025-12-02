"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { IconBowl, IconDotsVertical, IconHeartbeat, IconScale } from "@tabler/icons-react";
import type { AnimalRecord } from "../types";

interface AnimalActionsMenuProps {
    animal: AnimalRecord;
    onOpenHealthRecords: () => void;
    onOpenWeightRecords: () => void;
    onOpenFeedRecords: () => void;
}

export default function AnimalActionsMenu({
    animal,
    onOpenHealthRecords,
    onOpenWeightRecords,
    onOpenFeedRecords,
}: AnimalActionsMenuProps) {
    return (
        <Menu
            withinPortal
            width={200}
            position="bottom-end"
            shadow="sm"
        >
            <Menu.Target>
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="More options"
                >
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconHeartbeat size={16} />}
                    onClick={onOpenHealthRecords}
                >
                    Health records
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconScale size={16} />}
                    onClick={onOpenWeightRecords}
                >
                    Weight record
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconBowl size={16} />}
                    onClick={onOpenFeedRecords}
                >
                    Feed records
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

