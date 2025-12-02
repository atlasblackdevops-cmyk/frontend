"use client";

import {
    Button,
    Divider,
    Drawer,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { IconShieldCheck } from "@tabler/icons-react";
import type { ManagedUser, ModuleDefinition, PermissionMatrix } from "../types";
import { PermissionTable, PermissionPreview } from "../components";

interface PermissionsDrawerProps {
    opened: boolean;
    onClose: () => void;
    user: ManagedUser | null;
    moduleDefinitions: ModuleDefinition[];
    permissionColumns: string[];
    permissionDraft: PermissionMatrix;
    onTogglePermission: (moduleName: string, action: string) => void;
    onToggleModuleAll: (moduleName: string) => void;
    getModulePermissionState: (moduleName: string) => {
        checked: boolean;
        indeterminate: boolean;
    };
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
}

export default function PermissionsDrawer({
    opened,
    onClose,
    user,
    moduleDefinitions,
    permissionColumns,
    permissionDraft,
    onTogglePermission,
    onToggleModuleAll,
    getModulePermissionState,
    onSubmit,
    isSubmitting,
}: PermissionsDrawerProps) {
    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="lg"
            title={
                <Group gap="xs">
                    <IconShieldCheck size={18} />
                    <Text fw={600}>Update permissions</Text>
                </Group>
            }
        >
            {user ? (
                <form onSubmit={onSubmit}>
                    <Stack>
                        <div>
                            <Text fw={600}>{user.name}</Text>
                            <Text size="sm" c="dimmed">
                                {user.email}
                            </Text>
                        </div>
                        <PermissionTable
                            moduleDefinitions={moduleDefinitions}
                            permissionColumns={permissionColumns}
                            permissionDraft={permissionDraft}
                            onTogglePermission={onTogglePermission}
                            onToggleModuleAll={onToggleModuleAll}
                            getModulePermissionState={getModulePermissionState}
                        />
                        <Divider my="sm" />
                        <Stack gap="xs">
                            <Text size="sm" fw={600}>
                                Current access summary
                            </Text>
                            <PermissionPreview permissionDraft={permissionDraft} />
                        </Stack>
                        <Group justify="flex-end">
                            <Button variant="default" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                Save permissions
                            </Button>
                        </Group>
                    </Stack>
                </form>
            ) : (
                <Text size="sm" c="dimmed">
                    Select a user to update permissions.
                </Text>
            )}
        </Drawer>
    );
}

