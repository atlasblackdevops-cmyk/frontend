"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Divider,
    Drawer,
    Group,
    Loader,
    Paper,
    PasswordInput,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus } from "@tabler/icons-react";
import type { ManagedUser, ModuleDefinition, PermissionMatrix } from "../types";
import { PermissionTable, PermissionPreview } from "../components";

interface UserDrawerProps {
    opened: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    user: ManagedUser | null;
    roleOptions: { value: string; label: string }[];
    moduleDefinitions: ModuleDefinition[];
    permissionColumns: string[];
    permissionDraft: PermissionMatrix;
    onPermissionDraftChange: (draft: PermissionMatrix) => void;
    onTogglePermission: (moduleName: string, action: string) => void;
    onToggleModuleAll: (moduleName: string) => void;
    getModulePermissionState: (moduleName: string) => {
        checked: boolean;
        indeterminate: boolean;
    };
    onSubmit: (values: {
        name: string;
        email: string;
        password: string;
        roleId: string;
    }) => Promise<void>;
    isSubmitting: boolean;
}

export default function UserDrawer({
    opened,
    onClose,
    mode,
    user,
    roleOptions,
    moduleDefinitions,
    permissionColumns,
    permissionDraft,
    onPermissionDraftChange,
    onTogglePermission,
    onToggleModuleAll,
    getModulePermissionState,
    onSubmit,
    isSubmitting,
}: UserDrawerProps) {
    const form = useForm({
        initialValues: {
            name: "",
            email: "",
            password: "",
            roleId: "",
        },
        validate: (values) => ({
            name:
                values.name.trim().length < 3
                    ? "Name must be at least 3 characters"
                    : null,
            email: /^\S+@\S+$/.test(values.email)
                ? null
                : "Please enter a valid email",
            password:
                mode === "edit"
                    ? null // Password optional when editing
                    : !values.password || values.password.length === 0
                      ? "Password is required"
                      : values.password.length < 8
                        ? "Password must be at least 8 characters"
                        : null,
        }),
    });

    useEffect(() => {
        if (opened && user && mode === "edit") {
            form.setValues({
                name: user.name,
                email: user.email,
                password: "",
                roleId: user.roleId,
            });
        } else if (opened && mode === "create") {
            form.reset();
            if (roleOptions.length > 0 && !form.values.roleId) {
                form.setFieldValue("roleId", roleOptions[0].value);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, user?.id, mode]);

    const handleSubmit = form.onSubmit(async (values) => {
        await onSubmit(values);
        if (mode === "create") {
            form.reset();
        }
    });

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="lg"
            title={
                <Group gap="xs">
                    <IconUserPlus size={18} />
                    <Text fw={600}>
                        {mode === "edit" ? "Update user" : "Invite new user"}
                    </Text>
                </Group>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <TextInput
                        label="Full name"
                        placeholder="Ex: John Doe"
                        withAsterisk
                        {...form.getInputProps("name")}
                    />
                    <TextInput
                        label="Email"
                        placeholder="johndoe@gmail.com"
                        withAsterisk
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Password"
                        withAsterisk={!user}
                        description={
                            user
                                ? "Leave blank to keep the existing password"
                                : "Minimum 8 characters"
                        }
                        {...form.getInputProps("password")}
                    />
                    <Select
                        label="Role"
                        placeholder="Choose role"
                        data={roleOptions}
                        withAsterisk
                        comboboxProps={{ withinPortal: true }}
                        {...form.getInputProps("roleId")}
                    />
                    {mode === "create" && (
                        <Paper withBorder radius="md" p="md">
                            <div style={{ marginBottom: "1rem" }}>
                                <Text fw={600}>Permissions</Text>
                                <Text size="sm" c="dimmed">
                                    Toggle module access to fine tune this user.
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
                        </Paper>
                    )}
                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader size="sm" mr="xs" />
                                    Creating...
                                </>
                            ) : mode === "edit" ? (
                                "Save changes"
                            ) : (
                                "Send invite"
                            )}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    );
}

