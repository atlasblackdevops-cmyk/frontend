"use client";

import { Button, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { ReactNode } from "react";

/**
 * Standardized action button styles for table actions.
 * Ensures consistent UI across all modules.
 */
export const actionButtonStyle = {
    minWidth: 36,
    minHeight: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexShrink: 0,
};

export const actionIconStyle = { width: 18, height: 18, flexShrink: 0 };

interface TableActionButtonsProps {
    canUpdate?: boolean;
    canDelete?: boolean;
    onUpdate: () => void;
    onDelete: () => void;
    updateLabel?: string;
    deleteLabel?: string;
    justify?: "flex-start" | "flex-end" | "center";
    customActions?: ReactNode;
}

/**
 * Standardized action buttons component for table rows.
 * Provides consistent edit and delete button UI across all modules.
 */
export default function TableActionButtons({
    canUpdate = true,
    canDelete = true,
    onUpdate,
    onDelete,
    updateLabel = "Edit",
    deleteLabel = "Delete",
    justify = "flex-start",
    customActions,
}: TableActionButtonsProps) {
    return (
        <Group justify={justify} gap="xs" wrap="nowrap">
            {canUpdate && (
              <Tooltip label="Edit" position="top" withArrow>
              <Button
                    variant="subtle"
                    size="md"
                    px="xs"
                    style={actionButtonStyle}
                    aria-label={updateLabel}
                    onClick={onUpdate}
                >
                    <IconEdit size={18} style={actionIconStyle} />
                </Button>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip label="Delete" position="top" withArrow>
                <Button
                    variant="subtle"
                    color="red"
                    size="md"
                    px="xs"
                    style={actionButtonStyle}
                    aria-label={deleteLabel}
                    onClick={onDelete}
                >
                    <IconTrash size={18} style={actionIconStyle} />
                </Button>
              </Tooltip>
            )}
            {customActions}
        </Group>
    );
}

