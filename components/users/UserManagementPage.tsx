"use client";

import { FormEvent, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import {
    Button,
    Group,
    Loader,
    Notification,
    Pagination,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconCheck,
    IconUserPlus,
    IconUsersGroup,
    IconX,
    IconSearch,
} from "@tabler/icons-react";
import { BaseInput } from "@/components/ui";
import type { ManagedUser, PermissionMatrix } from "./types";
import { useUsers, useRoles, usePermissions } from "./hooks";
import { UserStats, UserFilters, UserTable } from "./components";
import { UserDrawer, PermissionsDrawer, ExistingUserDrawer, UserFiltersDrawer } from "./drawers";
import { normalizePermissions, toTitleCase } from "@/lib/users/utils";
import { updateUser } from "@/lib/users/api";

export function UserManagementPage() {
    const { farmId } = useAuth();

    // Filters and pagination state
    const [filters, setFilters] = useState({
        search: "",
        role: "all",
        status: "all",
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Hooks
    const { roles, roleOptions, getRoleLabel } = useRoles();
    const {
        permissionModules,
        moduleDefinitions,
        permissionColumns,
        getPermissionIds,
        buildEmptyState,
        normalize,
    } = usePermissions();

    const {
        users,
        isLoading: isLoadingUsers,
        pagination: usersPagination,
        fetchUsers,
        createUser: createUserHook,
        updateUser: updateUserHook,
        addExistingUser: addExistingUserHook,
        setUsers,
        setPagination: setUsersPagination,
    } = useUsers({ moduleDefinitions, filters });

    // Sync pagination
    useEffect(() => {
        setPagination(usersPagination);
    }, [usersPagination]);

    // Drawer states
    const [userDrawerOpened, setUserDrawerOpened] = useState(false);
    const [existingUserDrawerOpened, setExistingUserDrawerOpened] =
        useState(false);
    const [permissionsDrawerOpened, setPermissionsDrawerOpened] =
        useState(false);
    const [filtersDrawerOpened, setFiltersDrawerOpened] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [activeUser, setActiveUser] = useState<ManagedUser | null>(null);
    const [permissionDraft, setPermissionDraft] =
        useState<PermissionMatrix>(buildEmptyState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Fetch users when filters or pagination changes
    useEffect(() => {
        if (moduleDefinitions.length > 0) {
            fetchUsers(pagination.page, pagination.limit);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.role,
        filters.status,
        filters.search,
        pagination.page,
        pagination.limit,
        moduleDefinitions.length,
    ]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (moduleDefinitions.length > 0) {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchUsers(1, pagination.limit);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search, moduleDefinitions.length]);

    // Refetch users when farm changes
    useEffect(() => {
        if (farmId && moduleDefinitions.length > 0) {
            setPagination((prev) => ({ ...prev, page: 1 }));
            setFilters({
                search: "",
                role: "all",
                status: "all",
            });
            fetchUsers(1, pagination.limit);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [farmId, moduleDefinitions.length]);

    // Permission management functions
    const togglePermission = useCallback(
        (moduleName: string, action: string) => {
            setPermissionDraft((prev) => {
                const current = prev[moduleName] ?? [];
                const hasPermission = current.includes(action);
                const updated = hasPermission
                    ? current.filter((value) => value !== action)
                    : [...current, action];
                return {
                    ...prev,
                    [moduleName]: updated,
                };
            });
        },
        []
    );

    const getModulePermissionState = useCallback(
        (moduleName: string) => {
            const module = moduleDefinitions.find(
                (m) => m.module === moduleName
            );
            if (!module || module.actions.length === 0) {
                return { checked: false, indeterminate: false };
            }

            const currentPermissions = permissionDraft[moduleName] ?? [];
            const availableActions = module.actions;

            const checkedActions = availableActions.filter((action) =>
                currentPermissions.includes(action)
            );
            const checkedCount = checkedActions.length;
            const totalCount = availableActions.length;

            const allChecked = checkedCount === totalCount && totalCount > 0;
            const someChecked = checkedCount > 0 && checkedCount < totalCount;

            return {
                checked: allChecked,
                indeterminate: someChecked,
            };
        },
        [moduleDefinitions, permissionDraft]
    );

    const toggleModuleAllPermissions = useCallback(
        (moduleName: string) => {
            const module = moduleDefinitions.find(
                (m) => m.module === moduleName
            );
            if (!module) return;
            const currentPermissions = permissionDraft[moduleName] ?? [];
            const availableActions = module.actions;
            const allChecked = availableActions.every((action) =>
                currentPermissions.includes(action)
            );
            const someChecked = availableActions.some((action) =>
                currentPermissions.includes(action)
            );

            setPermissionDraft((prev) => ({
                ...prev,
                [moduleName]:
                    allChecked || someChecked ? [] : [...availableActions],
            }));
        },
        [moduleDefinitions, permissionDraft]
    );

    // Drawer handlers
    const openUserDrawer = useCallback(
        (user?: ManagedUser) => {
            if (user) {
                setDrawerMode("edit");
                setActiveUser(user);
                setPermissionDraft(normalize(user.permissions));
            } else {
                setDrawerMode("create");
                setActiveUser(null);
                setPermissionDraft(buildEmptyState());
            }
            setUserDrawerOpened(true);
        },
        [normalize, buildEmptyState]
    );

    const closeUserDrawer = useCallback(() => {
        setUserDrawerOpened(false);
        setDrawerMode("create");
        setPermissionDraft(buildEmptyState());
        setActiveUser(null);
    }, [buildEmptyState]);

    const openExistingUserDrawer = useCallback(() => {
        setExistingUserDrawerOpened(true);
        setPermissionDraft(buildEmptyState());
    }, [buildEmptyState]);

    const closeExistingUserDrawer = useCallback(() => {
        setExistingUserDrawerOpened(false);
        setPermissionDraft(buildEmptyState());
    }, [buildEmptyState]);

    const openPermissionsDrawer = useCallback(
        (user: ManagedUser) => {
            setActiveUser(user);
            setPermissionDraft(normalize(user.permissions));
            setPermissionsDrawerOpened(true);
        },
        [normalize]
    );

    const closePermissionsDrawer = useCallback(() => {
        setPermissionsDrawerOpened(false);
        setPermissionDraft(buildEmptyState());
        setActiveUser(null);
    }, [buildEmptyState]);

    // Form submission handlers
    const handleUserSubmit = useCallback(
        async (values: {
            name: string;
            email: string;
            password: string;
            roleId: string;
        }) => {
            setIsSubmitting(true);
            setNotification(null);

            try {
                if (drawerMode === "edit" && activeUser) {
                    const updatePayload: {
                        name?: string;
                        email?: string;
                        password?: string;
                        roleId?: string;
                    } = {
                        name: values.name.trim(),
                        email: values.email.trim().toLowerCase(),
                        roleId: values.roleId,
                    };

                    if (values.password && values.password.length > 0) {
                        updatePayload.password = values.password;
                    }

                    const updatedUser = await updateUserHook(
                        activeUser.id,
                        updatePayload
                    );

                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === activeUser.id ? updatedUser : u
                        )
                    );
                    setActiveUser(updatedUser);

                    setNotification({
                        type: "success",
                        message: "User updated successfully",
                    });
                    setTimeout(() => setNotification(null), 5000);
                    closeUserDrawer();
                } else {
                    const permissionIds = getPermissionIds(permissionDraft);
                    const newUser = await createUserHook({
                        name: values.name.trim(),
                        email: values.email.trim().toLowerCase(),
                        password: values.password,
                        roleId: values.roleId,
                        permissionIds,
                    });

                    setUsers((prev) => [...prev, newUser]);
                    setNotification({
                        type: "success",
                        message: "User created successfully",
                    });
                    setTimeout(() => setNotification(null), 5000);
                    closeUserDrawer();
                    fetchUsers(pagination.page, pagination.limit);
                }
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to save user. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                setTimeout(() => setNotification(null), 7000);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            drawerMode,
            activeUser,
            permissionDraft,
            getPermissionIds,
            updateUserHook,
            createUserHook,
            setUsers,
            closeUserDrawer,
            fetchUsers,
            pagination.page,
            pagination.limit,
        ]
    );

    const handleExistingUserSubmit = useCallback(
        async (values: { userId: string; roleId: string }) => {
            setIsSubmitting(true);
            setNotification(null);

            try {
                const permissionIds = getPermissionIds(permissionDraft);
                const newUser = await addExistingUserHook({
                    userId: values.userId,
                    roleId: values.roleId,
                    permissionIds,
                });

                setUsers((prev) => [...prev, newUser]);
                setNotification({
                    type: "success",
                    message: "User added to farm successfully",
                });
                setTimeout(() => setNotification(null), 5000);
                closeExistingUserDrawer();
                fetchUsers(pagination.page, pagination.limit);
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to add existing user. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                setTimeout(() => setNotification(null), 7000);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            permissionDraft,
            getPermissionIds,
            addExistingUserHook,
            setUsers,
            closeExistingUserDrawer,
            fetchUsers,
            pagination.page,
            pagination.limit,
        ]
    );

    const handlePermissionsSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!activeUser) return;

            setIsSubmitting(true);
            setNotification(null);

            try {
                const permissionIds = getPermissionIds(permissionDraft);
                const responseData = await updateUser(activeUser.id, {
                    permissionIds: permissionIds,
                });

                if (responseData) {
                    const { user, role, permissions } = responseData;

                    const userPermissions: PermissionMatrix = {};
                    if (Array.isArray(permissions)) {
                        permissions.forEach((perm: any) => {
                            const moduleName = toTitleCase(perm.module || "");
                            const action = perm.action?.toLowerCase() || "";
                            if (moduleName && action) {
                                if (!userPermissions[moduleName]) {
                                    userPermissions[moduleName] = [];
                                }
                                userPermissions[moduleName].push(action);
                            }
                        });
                    }

                    const nextPermissions = normalizePermissions(
                        moduleDefinitions,
                        userPermissions
                    );

                    const updatedUser: ManagedUser = {
                        ...activeUser,
                        permissions: nextPermissions,
                        roleId: role?.id || activeUser.roleId,
                        roleName: role?.roleName || activeUser.roleName,
                    };

                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === activeUser.id ? updatedUser : u
                        )
                    );
                    setActiveUser(updatedUser);

                    setNotification({
                        type: "success",
                        message: "Permissions updated successfully",
                    });
                    setTimeout(() => setNotification(null), 5000);
                    closePermissionsDrawer();
                }
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update permissions. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                setTimeout(() => setNotification(null), 7000);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            activeUser,
            permissionDraft,
            getPermissionIds,
            moduleDefinitions,
            setUsers,
            closePermissionsDrawer,
        ]
    );

    const handleStatusToggle = useCallback(
        async (userId: string, checked: boolean) => {
            const user = users.find((u) => u.id === userId);
            if (!user) return;

            const newStatus = checked ? "active" : "inactive";
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? {
                              ...u,
                              status: newStatus,
                              isActive: checked,
                          }
                        : u
                )
            );
            setActiveUser((prev) =>
                prev && prev.id === userId
                    ? {
                          ...prev,
                          status: newStatus,
                          isActive: checked,
                      }
                    : prev
            );

            try {
                await updateUser(userId, { isActive: checked });
                setNotification({
                    type: "success",
                    message: `User ${checked ? "activated" : "deactivated"} successfully`,
                });
                setTimeout(() => setNotification(null), 5000);
            } catch (error: any) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId
                            ? {
                                  ...u,
                                  status: user.status,
                                  isActive: user.isActive,
                              }
                            : u
                    )
                );
                setActiveUser((prev) =>
                    prev && prev.id === userId
                        ? {
                              ...prev,
                              status: user.status,
                              isActive: user.isActive,
                          }
                        : prev
                );

                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update user status. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                setTimeout(() => setNotification(null), 7000);
            }
        },
        [users]
    );

    const handleSearchChange = (searchValue: string) => {
        setFilters((prev) => ({ ...prev, search: searchValue }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleApplyFilters = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({ search: "", role: "all", status: "all" });
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    return (
        <Paper 
            p={26} 
            radius="none" 
            withBorder={false} 
            style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
                {notification && (
                    <Notification
                        icon={
                            notification.type === "success" ? (
                                <IconCheck size={18} />
                            ) : (
                                <IconX size={18} />
                            )
                        }
                        color={notification.type === "success" ? "teal" : "red"}
                        title={
                            notification.type === "success" ? "Success" : "Error"
                        }
                        onClose={() => setNotification(null)}
                        withCloseButton
                        style={{ flexShrink: 0 }}
                    >
                        {notification.message}
                    </Notification>
                )}

                {/* Header */}
                <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
                    <div>
                        <Title order={2}>Users & Permissions</Title>
                        <Text c="dimmed" size="sm">
                            Manage users and their permissions
                        </Text>
                    </div>
                    <Group>
                        <Button
                            leftSection={<IconUserPlus size={16} />}
                            onClick={() => openUserDrawer()}
                        >
                            Add user
                        </Button>
                        <Button
                            variant="light"
                            leftSection={<IconUsersGroup size={16} />}
                            onClick={openExistingUserDrawer}
                        >
                            Add existing user
                        </Button>
                    </Group>
                </Group>

                {/* User Stats */}
                <div style={{ flexShrink: 0 }}>
                    <UserStats users={users} pagination={pagination} />
                </div>

                {/* Search and Filters */}
                <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <BaseInput
                        placeholder="Search users by name or email..."
                        leftSection={<IconSearch size={16} />}
                        style={{ 
                            width: "100%",
                            maxWidth: 500,
                            flex: "1 1 0",
                            minWidth: 0
                        }}
                        styles={{
                            input: {
                                height: "42px",
                                minHeight: "42px",
                            },
                        }}
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearchChange(filters.search);
                            }
                        }}
                    />
                    <UserFilters onOpenFilters={() => setFiltersDrawerOpened(true)} />
                </Group>

                {/* Table - Scrollable container */}
                <div 
                    style={{ 
                        flex: "1 1 0",
                        minHeight: 0,
                        width: "100%",
                        maxHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden"
                    }}
                >
                    <div style={{ 
                        width: "100%",
                        flex: "1 1 0",
                        minHeight: 0,
                        maxHeight: "100%",
                        overflow: "auto"
                    }}>
                        <UserTable
                            users={users}
                            isLoading={isLoadingUsers}
                            getRoleLabel={getRoleLabel}
                            onStatusToggle={handleStatusToggle}
                            onUpdateUser={openUserDrawer}
                            onUpdatePermissions={openPermissionsDrawer}
                        />
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Group 
                        justify="center"
                        style={{
                            flexShrink: 0,
                            paddingTop: 16,
                            paddingBottom: 16,
                        }}
                    >
                        <Pagination
                            value={pagination.page}
                            onChange={(page) => {
                                setPagination((prev) => ({ ...prev, page }));
                                fetchUsers(page, pagination.limit);
                            }}
                            total={pagination.totalPages}
                            size="sm"
                        />
                    </Group>
                )}
            </Stack>

            <UserDrawer
                opened={userDrawerOpened}
                onClose={closeUserDrawer}
                mode={drawerMode}
                user={activeUser}
                roleOptions={roleOptions}
                moduleDefinitions={moduleDefinitions}
                permissionColumns={permissionColumns}
                permissionDraft={permissionDraft}
                onPermissionDraftChange={setPermissionDraft}
                onTogglePermission={togglePermission}
                onToggleModuleAll={toggleModuleAllPermissions}
                getModulePermissionState={getModulePermissionState}
                onSubmit={handleUserSubmit}
                isSubmitting={isSubmitting}
            />

            <PermissionsDrawer
                opened={permissionsDrawerOpened}
                onClose={closePermissionsDrawer}
                user={activeUser}
                moduleDefinitions={moduleDefinitions}
                permissionColumns={permissionColumns}
                permissionDraft={permissionDraft}
                onTogglePermission={togglePermission}
                onToggleModuleAll={toggleModuleAllPermissions}
                getModulePermissionState={getModulePermissionState}
                onSubmit={handlePermissionsSubmit}
                isSubmitting={isSubmitting}
            />

            <ExistingUserDrawer
                opened={existingUserDrawerOpened}
                onClose={closeExistingUserDrawer}
                roleOptions={roleOptions}
                moduleDefinitions={moduleDefinitions}
                permissionColumns={permissionColumns}
                permissionDraft={permissionDraft}
                onPermissionDraftChange={setPermissionDraft}
                onTogglePermission={togglePermission}
                onToggleModuleAll={toggleModuleAllPermissions}
                getModulePermissionState={getModulePermissionState}
                existingUsers={users}
                onSubmit={handleExistingUserSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Filters Drawer */}
            <UserFiltersDrawer
                opened={filtersDrawerOpened}
                onClose={() => setFiltersDrawerOpened(false)}
                filters={filters}
                roleOptions={roleOptions}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />
        </Paper>
    );
}

export default UserManagementPage;
