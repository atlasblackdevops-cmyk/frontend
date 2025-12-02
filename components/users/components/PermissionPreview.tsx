"use client";

import { Badge, Group, Stack, Text } from "@mantine/core";
import type { PermissionMatrix } from "../types";

interface PermissionPreviewProps {
    permissionDraft: PermissionMatrix;
}

export default function PermissionPreview({
    permissionDraft,
}: PermissionPreviewProps) {
    const preview = Object.entries(permissionDraft)
        .map(([moduleName, actions]) => {
            if (!actions.length) return null;
            return (
                <Group gap={6} key={moduleName}>
                    <Text fw={500} size="sm">
                        {moduleName}
                    </Text>
                    <Group gap={4} wrap="wrap">
                        {actions.map((action) => (
                            <Badge key={`${moduleName}-${action}`} size="sm" color="gray">
                                {action}
                            </Badge>
                        ))}
                    </Group>
                </Group>
            );
        })
        .filter(Boolean);

    if (preview.length === 0) {
        return (
            <Text size="sm" c="dimmed">
                No permissions selected yet.
            </Text>
        );
    }

    return (
        <Stack gap="xs">
            {preview}
        </Stack>
    );
}

