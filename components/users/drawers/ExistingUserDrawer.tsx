"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Avatar,
    Autocomplete,
    Button,
    Divider,
    Drawer,
    Group,
    Loader,
    Paper,
    Select,
    Stack,
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch, IconUsersGroup } from "@tabler/icons-react";
import type {
    ManagedUser,
    ModuleDefinition,
    PermissionMatrix,
} from "../types";
import { getAllUsers } from "@/lib/users/api";
import { PermissionTable, PermissionPreview } from "../components";

interface ExistingUserDrawerProps {
    opened: boolean;
    onClose: () => void;
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
    existingUsers: ManagedUser[];
    onSubmit: (values: { userId: string; roleId: string }) => Promise<void>;
    isSubmitting: boolean;
}

export default function ExistingUserDrawer({
    opened,
    onClose,
    roleOptions,
    moduleDefinitions,
    permissionColumns,
    permissionDraft,
    onPermissionDraftChange,
    onTogglePermission,
    onToggleModuleAll,
    getModulePermissionState,
    existingUsers,
    onSubmit,
    isSubmitting,
}: ExistingUserDrawerProps) {
    const form = useForm({
        initialValues: {
            userId: "",
            roleId: "",
        },
        validate: (values) => ({
            userId: !values.userId ? "Please select a user" : null,
            roleId: !values.roleId ? "Please select a role" : null,
        }),
    });

    const [existingUsersSearch, setExistingUsersSearch] = useState("");
    const [existingUsersList, setExistingUsersList] = useState<
        Array<{ id: string; name: string; email: string }>
    >([]);
    const [isLoadingExistingUsers, setIsLoadingExistingUsers] = useState(false);
    const [selectedExistingUser, setSelectedExistingUser] = useState<{
        id: string;
        name: string;
        email: string;
    } | null>(null);

    useEffect(() => {
        if (!opened) {
            form.reset();
            setExistingUsersSearch("");
            setExistingUsersList([]);
            setSelectedExistingUser(null);
            return;
        }

        if (roleOptions.length > 0 && !form.values.roleId) {
            form.setFieldValue("roleId", roleOptions[0].value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const timeoutId = setTimeout(() => {
            if (existingUsersSearch && existingUsersSearch.trim().length >= 2) {
                fetchExistingUsers(existingUsersSearch);
            } else {
                setExistingUsersList([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingUsersSearch, opened]);

    const fetchExistingUsers = async (searchQuery: string) => {
        setIsLoadingExistingUsers(true);
        try {
            const apiUsers = await getAllUsers(searchQuery);
            const currentFarmUserIds = new Set(existingUsers.map((u) => u.id));
            const availableUsers = apiUsers
                .filter((apiUser) => !currentFarmUserIds.has(apiUser.id))
                .map((apiUser) => ({
                    id: apiUser.id,
                    name: apiUser.name,
                    email: apiUser.email,
                }));
            setExistingUsersList(availableUsers);
        } catch (error) {
            console.error("Failed to fetch existing users", error);
            setExistingUsersList([]);
        } finally {
            setIsLoadingExistingUsers(false);
        }
    };

    const autocompleteData = useMemo(() => {
        const allUsers = existingUsersList.map((user) => ({
            value: `${user.name} (${user.email})`,
            id: user.id,
            name: user.name,
            email: user.email,
        }));

        if (!existingUsersSearch || existingUsersSearch.trim().length === 0) {
            return allUsers;
        }

        const searchLower = existingUsersSearch.toLowerCase().trim();
        return allUsers.filter((user) =>
            user.value.toLowerCase().includes(searchLower)
        );
    }, [existingUsersList, existingUsersSearch]);

    const handleSubmit = form.onSubmit(async (values) => {
        await onSubmit(values);
        form.reset();
        setExistingUsersSearch("");
        setSelectedExistingUser(null);
    });

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="lg"
            title={
                <Group gap="xs">
                    <IconUsersGroup size={18} />
                    <Text fw={600}>Add existing user</Text>
                </Group>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Autocomplete
                        label="User"
                        placeholder="Search for user by name or email"
                        leftSection={<IconSearch size={16} />}
                        data={autocompleteData}
                        value={existingUsersSearch}
                        onChange={(value) => {
                            setExistingUsersSearch(value);
                            const selected = existingUsersList.find(
                                (u) => `${u.name} (${u.email})` === value
                            );
                            if (selected) {
                                setSelectedExistingUser(selected);
                                form.setFieldValue("userId", selected.id);
                            } else {
                                setSelectedExistingUser(null);
                                form.setFieldValue("userId", "");
                            }
                        }}
                        onOptionSubmit={(value) => {
                            const option = existingUsersList.find(
                                (u) => `${u.name} (${u.email})` === value
                            );
                            if (option) {
                                setSelectedExistingUser(option);
                                form.setFieldValue("userId", option.id);
                            }
                        }}
                        rightSection={
                            isLoadingExistingUsers ? <Loader size="xs" /> : null
                        }
                        withAsterisk
                        error={form.errors.userId}
                        comboboxProps={{ withinPortal: true }}
                    />
                    {selectedExistingUser && (
                        <Paper withBorder radius="md" p="sm" bg="gray.0">
                            <Group gap="xs">
                                <Avatar color="cyan" radius="xl" size="sm">
                                    {selectedExistingUser.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(0, 2)
                                        .join("")}
                                </Avatar>
                                <div>
                                    <Text size="sm" fw={500}>
                                        {selectedExistingUser.name}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {selectedExistingUser.email}
                                    </Text>
                                </div>
                            </Group>
                        </Paper>
                    )}
                    <Select
                        label="Role"
                        placeholder="Choose role"
                        data={roleOptions}
                        withAsterisk
                        comboboxProps={{ withinPortal: true }}
                        {...form.getInputProps("roleId")}
                    />
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
                                    Adding...
                                </>
                            ) : (
                                "Add to farm"
                            )}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    );
}

