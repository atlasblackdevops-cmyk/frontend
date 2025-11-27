"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import {
    ActionIcon,
    Avatar,
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Divider,
    Drawer,
    Group,
    Loader,
    Menu,
    Notification,
    Pagination,
    Paper,
    PasswordInput,
    ScrollArea,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconCheck,
    IconDotsVertical,
    IconFilter,
    IconSearch,
    IconShieldCheck,
    IconShieldLock,
    IconUserEdit,
    IconUserPlus,
    IconUsersGroup,
    IconX,
} from "@tabler/icons-react";

type PermissionMatrix = Record<string, string[]>;

interface ModuleDefinition {
    module: string;
    actions: string[];
}

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive";
    roleId: string;
    roleName?: string;
    permissions: PermissionMatrix;
    avatarColor: string;
    isActive: boolean;
    createdAt?: string;
}

interface ApiUserResponse {
    farmMemberId?: string;
    user: {
        id: string;
        email: string;
        name: string;
        mobile?: string;
        isActive: boolean;
        emailVerified: boolean;
        createdAt: string;
        updatedAt?: string;
    };
    role: {
        id: string;
        roleName: string;
    };
    permissions: Array<{
        id: string;
        module: string;
        action: string;
        description?: string;
    }>;
    createdAt: string;
    updatedAt?: string;
}

interface ExistingUserResponse {
    id: string;
    email: string;
    name: string;
    mobile?: string | null;
    isActive: boolean;
    emailVerified: boolean;
    farms?: Array<{
        farmMemberId: string;
        farm: {
            id: string;
            farmName: string;
        };
        role: {
            id: string;
            roleName: string;
        };
    }>;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface AccessRole {
    id: string;
    roleName?: string | null;
}

interface PermissionActionDefinition {
    id: string;
    action: string;
    description?: string;
}

interface PermissionModule {
    module: string;
    actions: PermissionActionDefinition[];
}

const buildEmptyPermissionState = (
    modules: ModuleDefinition[]
): PermissionMatrix =>
    modules.reduce<PermissionMatrix>((acc, module) => {
        acc[module.module] = [];
        return acc;
    }, {});

const normalizePermissions = (
    modules: ModuleDefinition[],
    matrix?: PermissionMatrix
): PermissionMatrix => {
    const emptyState = buildEmptyPermissionState(modules);
    if (!matrix) return emptyState;
    const normalized: PermissionMatrix = {};
    modules.forEach((module) => {
        const allowed = matrix[module.module] ?? [];
        normalized[module.module] = module.actions.filter((action) =>
            allowed.includes(action)
        );
    });
    return { ...emptyState, ...normalized };
};

const toTitleCase = (value: string) => {
    if (!value) return value;
    return value
        .toLowerCase()
        .split(/[\s_]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

export function UserManagementPage() {
    const { farmId } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [filters, setFilters] = useState({
        search: "",
        role: "all",
        status: "all",
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userDrawerOpened, setUserDrawerOpened] = useState(false);
    const [existingUserDrawerOpened, setExistingUserDrawerOpened] =
        useState(false);
    const [permissionsDrawerOpened, setPermissionsDrawerOpened] =
        useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [activeUser, setActiveUser] = useState<ManagedUser | null>(null);
    const [existingUsersSearch, setExistingUsersSearch] = useState("");
    const [existingUsersList, setExistingUsersList] = useState<
        Array<{ id: string; name: string; email: string }>
    >([]);
    const [isLoadingExistingUsers, setIsLoadingExistingUsers] = useState(false);
    const autocompleteScrollRef = useRef<HTMLDivElement>(null);
    const [selectedExistingUser, setSelectedExistingUser] = useState<{
        id: string;
        name: string;
        email: string;
    } | null>(null);
    const [moduleDefinitions, setModuleDefinitions] = useState<
        ModuleDefinition[]
    >([]);
    const [permissionModules, setPermissionModules] = useState<
        PermissionModule[]
    >([]);
    const [roleOptions, setRoleOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [permissionDraft, setPermissionDraft] = useState<PermissionMatrix>(
        () => buildEmptyPermissionState([])
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const permissionColumns = useMemo(
        () =>
            Array.from(
                new Set(moduleDefinitions.flatMap((module) => module.actions))
            ),
        [moduleDefinitions]
    );

    useEffect(() => {
        let isMounted = true;

        const fetchRoles = async () => {
            try {
                const response = await api.get("/api/v1/access/roles");
                if (!isMounted) return;
                const payload = Array.isArray(response.data?.data)
                    ? (response.data?.data as AccessRole[])
                    : [];
                if (!payload.length) return;
                const options = payload.map((role) => {
                    const formattedLabel = toTitleCase(role.roleName ?? "");
                    return {
                        value: role.id,
                        label: formattedLabel || role.roleName || role.id,
                    };
                });
                setRoleOptions(options);
                // Set default roleId if form is empty
                if (!form.values.roleId && options.length > 0) {
                    form.setFieldValue("roleId", options[0].value);
                }
            } catch (error) {
                console.error("Failed to fetch roles", error);
            }
        };

        const fetchPermissions = async () => {
            try {
                const response = await api.get("/api/v1/access/permissions");
                if (!isMounted) return;
                const payload = Array.isArray(response.data?.data)
                    ? (response.data?.data as PermissionModule[])
                    : [];
                if (!payload.length) return;

                // Store full permission modules with IDs
                setPermissionModules(payload);

                // Create normalized module definitions for UI
                const normalized = payload
                    .map((module) => {
                        const rawModuleName = module?.module ?? "";
                        const moduleName =
                            toTitleCase(rawModuleName) || rawModuleName;
                        if (!moduleName) return null;
                        const actions = Array.isArray(module?.actions)
                            ? module.actions
                                  .map((action) =>
                                      typeof action?.action === "string"
                                          ? action.action.toLowerCase()
                                          : null
                                  )
                                  .filter(
                                      (action): action is string => !!action
                                  )
                            : [];
                        return {
                            module: moduleName,
                            actions,
                        } as ModuleDefinition;
                    })
                    .filter(Boolean) as ModuleDefinition[];

                if (normalized.length) {
                    setModuleDefinitions(normalized);
                    setPermissionDraft((prev) =>
                        normalizePermissions(normalized, prev)
                    );
                }
            } catch (error) {
                console.error("Failed to fetch permissions", error);
            }
        };

        fetchRoles();
        fetchPermissions();

        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch users when filters or pagination changes
    useEffect(() => {
        // Only fetch if moduleDefinitions are loaded (needed for conversion)
        if (moduleDefinitions.length > 0) {
            fetchUsers(pagination.page, pagination.limit);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.role,
        filters.status,
        pagination.page,
        pagination.limit,
        moduleDefinitions.length,
    ]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (moduleDefinitions.length > 0) {
                // Reset to page 1 when searching
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
            // Reset to page 1 when farm changes
            setPagination((prev) => ({ ...prev, page: 1 }));
            // Reset filters when farm changes
            setFilters({
                search: "",
                role: "all",
                status: "all",
            });
            // Fetch users for the new farm
            fetchUsers(1, pagination.limit);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [farmId, moduleDefinitions.length]);

    const getRoleLabel = (roleId: string) => {
        const role = roleOptions.find((r) => r.value === roleId);
        return role?.label ?? "Custom";
    };

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
                drawerMode === "edit"
                    ? null // Password optional when editing
                    : !values.password || values.password.length === 0
                      ? "Password is required"
                      : values.password.length < 8
                        ? "Password must be at least 8 characters"
                        : null,
        }),
    });

    const existingUserForm = useForm({
        initialValues: {
            userId: "",
            roleId: "",
        },
        validate: (values) => ({
            userId: !values.userId ? "Please select a user" : null,
            roleId: !values.roleId ? "Please select a role" : null,
        }),
    });

    // Convert API user response to ManagedUser
    const convertApiUserToManagedUser = (
        apiUser: ApiUserResponse
    ): ManagedUser => {
        const userPermissions: PermissionMatrix = {};
        if (Array.isArray(apiUser.permissions)) {
            apiUser.permissions.forEach((perm) => {
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

        return {
            id: apiUser.user.id, // Use user.id instead of apiUser.id
            name: apiUser.user.name,
            email: apiUser.user.email,
            status: apiUser.user.isActive ? "active" : "inactive",
            roleId: apiUser.role.id,
            roleName: apiUser.role.roleName,
            permissions: normalizePermissions(
                moduleDefinitions,
                userPermissions
            ),
            avatarColor: "cyan",
            isActive: apiUser.user.isActive,
            createdAt: apiUser.createdAt,
        };
    };

    // Fetch users from API
    const fetchUsers = async (page: number = 1, limit: number = 10) => {
        setIsLoadingUsers(true);
        try {
            const params: Record<string, string | number> = {
                page,
                limit,
            };

            if (filters.role !== "all") {
                params.roleId = filters.role;
            }

            if (filters.status !== "all") {
                params.isActive =
                    filters.status === "active" ? "true" : "false";
            }

            const queryString = new URLSearchParams(
                Object.entries(params).reduce(
                    (acc, [key, value]) => {
                        acc[key] = String(value);
                        return acc;
                    },
                    {} as Record<string, string>
                )
            ).toString();

            const response = await api.get(`/api/v1/users?${queryString}`);
            const responseData = response.data?.data;

            if (responseData) {
                const apiUsers: ApiUserResponse[] = responseData.users || [];
                const paginationInfo: PaginationInfo =
                    responseData.pagination || {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0,
                    };

                const managedUsers = apiUsers.map(convertApiUserToManagedUser);

                // Apply client-side search filter if needed
                const filtered = managedUsers.filter((user) => {
                    if (filters.search.length === 0) return true;
                    const searchLower = filters.search.toLowerCase();
                    return (
                        user.name.toLowerCase().includes(searchLower) ||
                        user.email.toLowerCase().includes(searchLower)
                    );
                });

                // Apply client-side search filter if needed
                let finalUsers = managedUsers;
                if (filters.search.length > 0) {
                    finalUsers = managedUsers.filter((user) => {
                        const searchLower = filters.search.toLowerCase();
                        return (
                            user.name.toLowerCase().includes(searchLower) ||
                            user.email.toLowerCase().includes(searchLower)
                        );
                    });
                }

                setUsers(finalUsers);
                setPagination(paginationInfo);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            setNotification({
                type: "error",
                message: "Failed to load users. Please try again.",
            });
            setTimeout(() => setNotification(null), 7000);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const stats = useMemo(() => {
        const total = pagination.total || users.length;
        const active = users.filter((user) => user.status === "active").length;
        const inactive = users.filter(
            (user) => user.status === "inactive"
        ).length;
        return [
            { label: "Total users", value: total, accent: "blue" },
            { label: "Active users", value: active, accent: "teal" },
            { label: "Inactive users", value: inactive, accent: "orange" },
        ];
    }, [users, pagination]);

    const openUserDrawer = (user?: ManagedUser) => {
        if (user) {
            setDrawerMode("edit");
            setActiveUser(user);
            form.setValues({
                name: user.name,
                email: user.email,
                password: "",
                roleId: user.roleId,
            });
        } else {
            setDrawerMode("create");
            setActiveUser(null);
            form.reset();
            setPermissionDraft(buildEmptyPermissionState(moduleDefinitions));
        }
        setUserDrawerOpened(true);
    };

    const closeUserDrawer = () => {
        setUserDrawerOpened(false);
        setDrawerMode("create");
        form.reset();
        setPermissionDraft(buildEmptyPermissionState(moduleDefinitions));
        setActiveUser(null);
    };

    // Fetch existing users for search (users not in current farm)
    const fetchExistingUsers = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setExistingUsersList([]);
            return;
        }

        setIsLoadingExistingUsers(true);
        try {
            const response = await api.get(
                `/api/v1/users/all?search=${encodeURIComponent(searchQuery)}`
            );
            const responseData = response.data?.data;
            if (responseData) {
                const apiUsers: ExistingUserResponse[] =
                    responseData.users || [];

                // Filter out users already in current farm
                const currentFarmUserIds = new Set(users.map((u) => u.id));
                const availableUsers = apiUsers
                    .filter((apiUser) => !currentFarmUserIds.has(apiUser.id))
                    .map((apiUser) => ({
                        id: apiUser.id,
                        name: apiUser.name,
                        email: apiUser.email,
                    }));

                setExistingUsersList(availableUsers);
            }
        } catch (error) {
            console.error("Failed to fetch existing users", error);
            setExistingUsersList([]);
        } finally {
            setIsLoadingExistingUsers(false);
        }
    };

    // Debounced search for existing users
    useEffect(() => {
        if (!existingUserDrawerOpened) return;

        const timeoutId = setTimeout(() => {
            // Only search if query has at least 2 characters
            if (existingUsersSearch && existingUsersSearch.trim().length >= 2) {
                fetchExistingUsers(existingUsersSearch);
            } else {
                // Clear list if search is empty or less than 2 characters
                setExistingUsersList([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingUsersSearch, existingUserDrawerOpened, users]);

    const openExistingUserDrawer = () => {
        setExistingUserDrawerOpened(true);
        existingUserForm.reset();
        setPermissionDraft(buildEmptyPermissionState(moduleDefinitions));
        setSelectedExistingUser(null);
        setExistingUsersSearch("");
        setExistingUsersList([]);
        // Set default roleId if form is empty
        if (!existingUserForm.values.roleId && roleOptions.length > 0) {
            existingUserForm.setFieldValue("roleId", roleOptions[0].value);
        }
    };

    const closeExistingUserDrawer = () => {
        setExistingUserDrawerOpened(false);
        existingUserForm.reset();
        setPermissionDraft(buildEmptyPermissionState(moduleDefinitions));
        setSelectedExistingUser(null);
        setExistingUsersSearch("");
        setExistingUsersList([]);
    };

    const openPermissionsDrawer = (user: ManagedUser) => {
        setActiveUser(user);
        setPermissionDraft(
            normalizePermissions(moduleDefinitions, user.permissions)
        );
        setPermissionsDrawerOpened(true);
    };

    const closePermissionsDrawer = () => {
        setPermissionsDrawerOpened(false);
        setPermissionDraft(buildEmptyPermissionState(moduleDefinitions));
        setActiveUser(null);
    };

    const togglePermission = (moduleName: string, action: string) => {
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
    };

    const getModulePermissionState = (moduleName: string) => {
        const module = moduleDefinitions.find((m) => m.module === moduleName);
        if (!module || module.actions.length === 0) {
            return { checked: false, indeterminate: false };
        }

        const currentPermissions = permissionDraft[moduleName] ?? [];
        const availableActions = module.actions;

        // Count how many available actions are checked
        const checkedActions = availableActions.filter((action) =>
            currentPermissions.includes(action)
        );
        const checkedCount = checkedActions.length;
        const totalCount = availableActions.length;

        // Only checked if ALL available actions are checked
        const allChecked = checkedCount === totalCount && totalCount > 0;
        // Indeterminate if some (but not all) are checked
        const someChecked = checkedCount > 0 && checkedCount < totalCount;

        return {
            checked: allChecked,
            indeterminate: someChecked,
        };
    };

    const toggleModuleAllPermissions = (moduleName: string) => {
        const module = moduleDefinitions.find((m) => m.module === moduleName);
        if (!module) return;
        const currentPermissions = permissionDraft[moduleName] ?? [];
        const availableActions = module.actions;
        const allChecked = availableActions.every((action) =>
            currentPermissions.includes(action)
        );
        const someChecked = availableActions.some((action) =>
            currentPermissions.includes(action)
        );

        // If all checked or some checked (indeterminate), uncheck all
        // If none checked, check all
        setPermissionDraft((prev) => ({
            ...prev,
            [moduleName]:
                allChecked || someChecked ? [] : [...availableActions],
        }));
    };

    // Helper function to map selected permissions to permission IDs
    const getPermissionIds = (
        selectedPermissions: PermissionMatrix
    ): string[] => {
        const permissionIds: string[] = [];

        Object.entries(selectedPermissions).forEach(([moduleName, actions]) => {
            if (!actions.length) return;

            // Find the original module (case-insensitive match)
            const originalModule = permissionModules.find(
                (pm) => toTitleCase(pm.module) === moduleName
            );

            if (!originalModule) return;

            // For each selected action, find its permission ID
            actions.forEach((action) => {
                const permission = originalModule.actions.find(
                    (p) => p.action.toLowerCase() === action.toLowerCase()
                );
                if (permission?.id) {
                    permissionIds.push(permission.id);
                }
            });
        });

        return permissionIds;
    };

    // Update user API call
    // Note: userId must be user.id (not farmMemberId)
    const updateUser = async (
        userId: string,
        payload: {
            name?: string;
            email?: string;
            password?: string;
            roleId?: string;
            isActive?: boolean;
            permissionIds?: string[];
        }
    ) => {
        try {
            const response = await api.put(`/api/v1/users/${userId}`, payload);
            return response.data?.data;
        } catch (error: any) {
            console.error("Failed to update user", error);
            throw error;
        }
    };

    const handleUserSubmit = form.onSubmit(async (values) => {
        if (drawerMode === "edit" && activeUser) {
            // Update user details via API
            setIsSubmitting(true);
            setNotification(null);

            try {
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

                // Only include password if provided
                if (values.password && values.password.length > 0) {
                    updatePayload.password = values.password;
                }

                const responseData = await updateUser(
                    activeUser.id,
                    updatePayload
                );

                if (responseData) {
                    const { user, permissions } = responseData;

                    // Convert permissions array to PermissionMatrix format
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

                    // Update user in the list
                    const updatedUser: ManagedUser = {
                        id: user.id,
                        name: user.name || values.name,
                        email: user.email,
                        status: user.isActive ? "active" : "inactive",
                        roleId: user.role?.id || values.roleId,
                        roleName: user.role?.roleName,
                        permissions: normalizePermissions(
                            moduleDefinitions,
                            userPermissions
                        ),
                        avatarColor: "cyan",
                        isActive: user.isActive,
                    };

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
                }
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update user. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                setTimeout(() => setNotification(null), 7000);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Create new user via API
            setIsSubmitting(true);
            setNotification(null);

            try {
                const permissionIds = getPermissionIds(permissionDraft);

                const payload = {
                    name: values.name.trim(),
                    email: values.email.trim().toLowerCase(),
                    password: values.password,
                    roleId: values.roleId,
                    permissionIds: permissionIds,
                };

                const response = await api.post("/api/v1/users", payload);

                // Handle response
                const responseData = response.data?.data;
                if (responseData) {
                    const { user, permissions } = responseData;

                    // Convert permissions array to PermissionMatrix format
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

                    // Add new user to the list
                    const newUser: ManagedUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        status: user.isActive ? "active" : "inactive",
                        roleId: user.role?.id || values.roleId,
                        roleName: user.role?.roleName,
                        permissions: normalizePermissions(
                            moduleDefinitions,
                            userPermissions
                        ),
                        avatarColor: "cyan",
                        isActive: user.isActive || false,
                    };

                    setUsers((prev) => [newUser, ...prev]);
                    setNotification({
                        type: "success",
                        message:
                            response.data?.message ||
                            "User created successfully",
                    });
                    // Auto-dismiss notification after 5 seconds
                    setTimeout(() => setNotification(null), 5000);
                    closeUserDrawer();
                    // Refresh the list to get updated pagination
                    fetchUsers(pagination.page, pagination.limit);
                }
            } catch (error: any) {
                console.error("Failed to create user", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to create user. Please try again.";
                setNotification({
                    type: "error",
                    message: errorMessage,
                });
                // Auto-dismiss error notification after 7 seconds
                setTimeout(() => setNotification(null), 7000);
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    const handleExistingUserSubmit = existingUserForm.onSubmit(
        async (values) => {
            if (!selectedExistingUser) {
                setNotification({
                    type: "error",
                    message: "Please select a user",
                });
                setTimeout(() => setNotification(null), 7000);
                return;
            }

            setIsSubmitting(true);
            setNotification(null);

            try {
                const permissionIds = getPermissionIds(permissionDraft);

                const payload = {
                    userId: selectedExistingUser.id,
                    roleId: values.roleId,
                    permissionIds: permissionIds,
                };

                const response = await api.post(
                    "/api/v1/users/add-existing",
                    payload
                );

                // Handle response
                const responseData = response.data?.data;
                if (responseData) {
                    const { user, permissions } = responseData;

                    // Convert permissions array to PermissionMatrix format
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

                    // Add new user to the list
                    const newUser: ManagedUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        status: user.isActive ? "active" : "inactive",
                        roleId: user.role?.id || values.roleId,
                        roleName: user.role?.roleName,
                        permissions: normalizePermissions(
                            moduleDefinitions,
                            userPermissions
                        ),
                        avatarColor: "cyan",
                        isActive: user.isActive || false,
                    };

                    setUsers((prev) => [newUser, ...prev]);
                    setNotification({
                        type: "success",
                        message:
                            response.data?.message ||
                            "User added to farm successfully",
                    });
                    setTimeout(() => setNotification(null), 5000);
                    closeExistingUserDrawer();
                    // Refresh the list to get updated pagination
                    fetchUsers(pagination.page, pagination.limit);
                }
            } catch (error: any) {
                console.error("Failed to add existing user", error);
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
        }
    );

    const handlePermissionsSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
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
                const { user, permissions } = responseData;

                // Convert permissions array to PermissionMatrix format
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
                    roleId: user.role?.id || activeUser.roleId,
                    roleName: user.role?.roleName || activeUser.roleName,
                };

                setUsers((prev) =>
                    prev.map((u) => (u.id === activeUser.id ? updatedUser : u))
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
    };

    const handleStatusToggle = async (userId: string, checked: boolean) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        // Optimistically update UI
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

        // Update via API
        try {
            await updateUser(userId, { isActive: checked });
            setNotification({
                type: "success",
                message: `User ${checked ? "activated" : "deactivated"} successfully`,
            });
            setTimeout(() => setNotification(null), 5000);
        } catch (error: any) {
            // Revert on error
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
    };

    const renderPermissionPreview = () =>
        Object.entries(permissionDraft).map(([moduleName, actions]) => {
            if (!actions.length) return null;
            return (
                <Group gap={6} key={moduleName}>
                    <Text fw={500} size="sm">
                        {moduleName}
                    </Text>
                    <Group gap={4} wrap="wrap">
                        {actions.map((action) => (
                            <Badge
                                key={`${moduleName}-${action}`}
                                size="sm"
                                color="gray"
                            >
                                {action}
                            </Badge>
                        ))}
                    </Group>
                </Group>
            );
        });

    return (
        <Stack gap="xl">
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
                >
                    {notification.message}
                </Notification>
            )}
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Users & Permissions</Title>
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

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {stats.map((item) => (
                    <Paper
                        key={item.label}
                        radius="lg"
                        p="md"
                        withBorder
                        shadow="xs"
                    >
                        <Text size="sm" c="dimmed">
                            {item.label}
                        </Text>
                        <Text fz={32} fw={700} c={`${item.accent}.6`}>
                            {item.value}
                        </Text>
                    </Paper>
                ))}
            </SimpleGrid>

            <Paper withBorder radius="lg" p="lg" shadow="xs">
                <Group justify="space-between" mb="md">
                    <Group gap="xs">
                        <Select
                            placeholder="Role"
                            leftSection={<IconShieldLock size={16} />}
                            data={[
                                { value: "all", label: "All roles" },
                                ...roleOptions,
                            ]}
                            value={filters.role}
                            onChange={(value) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    role: value ?? "all",
                                }));
                                // Reset to page 1 when filter changes
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            w={180}
                        />
                        <Select
                            placeholder="Status"
                            leftSection={<IconFilter size={16} />}
                            data={[
                                { value: "all", label: "All statuses" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                            ]}
                            value={filters.status}
                            w={180}
                            onChange={(value) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    status: value ?? "all",
                                }));
                                // Reset to page 1 when filter changes
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                        />
                        <TextInput
                            placeholder="Search users"
                            leftSection={<IconSearch size={16} />}
                            value={filters.search}
                            onChange={(event) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    search: event.currentTarget.value,
                                }))
                            }
                            style={{ flex: 1, maxWidth: 300 }}
                        />
                    </Group>
                </Group>

                {isLoadingUsers ? (
                    <Group justify="center" p="xl">
                        <Loader size="lg" />
                    </Group>
                ) : (
                    <>
                        <ScrollArea>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>User</Table.Th>
                                        <Table.Th>Role</Table.Th>
                                        <Table.Th>Modules</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {users.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={5}>
                                                <Text
                                                    ta="center"
                                                    c="dimmed"
                                                    py="xl"
                                                >
                                                    No users found
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        users.map((user) => (
                                            <Table.Tr key={user.id}>
                                                <Table.Td>
                                                    <Group gap="md">
                                                        <Avatar
                                                            color={
                                                                user.avatarColor
                                                            }
                                                            radius="xl"
                                                        >
                                                            {user.name
                                                                .split(" ")
                                                                .map(
                                                                    (part) =>
                                                                        part[0]
                                                                )
                                                                .slice(0, 2)
                                                                .join("")}
                                                        </Avatar>
                                                        <div>
                                                            <Text fw={600}>
                                                                {user.name}
                                                            </Text>
                                                            <Text
                                                                size="sm"
                                                                c="dimmed"
                                                            >
                                                                {user.email}
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color="gray"
                                                        variant="light"
                                                    >
                                                        {getRoleLabel(
                                                            user.roleId
                                                        )}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        {Object.entries(
                                                            user.permissions
                                                        )
                                                            .filter(
                                                                ([, actions]) =>
                                                                    actions.length >
                                                                    0
                                                            )
                                                            .slice(0, 3)
                                                            .map(
                                                                ([
                                                                    moduleName,
                                                                ]) => (
                                                                    <Badge
                                                                        key={`${user.id}-${moduleName}`}
                                                                        size="sm"
                                                                        variant="outline"
                                                                    >
                                                                        {
                                                                            moduleName
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        {Object.entries(
                                                            user.permissions
                                                        ).filter(
                                                            ([, actions]) =>
                                                                actions.length >
                                                                0
                                                        ).length > 3 && (
                                                            <Text
                                                                size="sm"
                                                                c="dimmed"
                                                            >
                                                                + more
                                                            </Text>
                                                        )}
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Stack gap={0}>
                                                        <Switch
                                                            checked={
                                                                user.status ===
                                                                "active"
                                                            }
                                                            onChange={(event) =>
                                                                handleStatusToggle(
                                                                    user.id,
                                                                    event
                                                                        .currentTarget
                                                                        .checked
                                                                )
                                                            }
                                                            color="teal"
                                                            size="md"
                                                        />
                                                        <Text
                                                            size="xs"
                                                            c="dimmed"
                                                        >
                                                            {user.status}
                                                        </Text>
                                                    </Stack>
                                                </Table.Td>
                                                <Table.Td width={80}>
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
                                                                <IconDotsVertical
                                                                    size={16}
                                                                />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={
                                                                    <IconUserEdit
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    openUserDrawer(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                Update user
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                leftSection={
                                                                    <IconShieldCheck
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    openPermissionsDrawer(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                                permissions
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                        {pagination.totalPages > 1 && (
                            <Group justify="center" mt="md">
                                <Pagination
                                    value={pagination.page}
                                    onChange={(page) =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            page,
                                        }))
                                    }
                                    total={pagination.totalPages}
                                    siblings={1}
                                    boundaries={1}
                                />
                            </Group>
                        )}
                    </>
                )}
            </Paper>

            <Drawer
                opened={userDrawerOpened}
                onClose={closeUserDrawer}
                position="right"
                size="lg"
                title={
                    <Group gap="xs">
                        <IconUserPlus size={18} />
                        <Text fw={600}>
                            {drawerMode === "edit"
                                ? "Update user"
                                : "Invite new user"}
                        </Text>
                    </Group>
                }
            >
                <form onSubmit={handleUserSubmit}>
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
                            withAsterisk={!activeUser}
                            description={
                                activeUser
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
                        {drawerMode === "create" && (
                            <Paper withBorder radius="md" p="md">
                                <div style={{ marginBottom: "1rem" }}>
                                    <Text fw={600}>Permissions</Text>
                                    <Text size="sm" c="dimmed">
                                        Toggle module access to fine tune this
                                        user.
                                    </Text>
                                </div>
                                <Box
                                    style={{
                                        border: "1px solid var(--mantine-color-gray-3)",
                                        borderRadius: 8,
                                    }}
                                >
                                    <Table
                                        horizontalSpacing="md"
                                        verticalSpacing="xs"
                                        withColumnBorders
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Module</Table.Th>
                                                {permissionColumns.map(
                                                    (action) => (
                                                        <Table.Th
                                                            key={`drawer-${action}`}
                                                        >
                                                            {action}
                                                        </Table.Th>
                                                    )
                                                )}
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {moduleDefinitions.map((module) => {
                                                const moduleState =
                                                    getModulePermissionState(
                                                        module.module
                                                    );
                                                return (
                                                    <Table.Tr
                                                        key={`drawer-${module.module}`}
                                                    >
                                                        <Table.Td>
                                                            <Group
                                                                gap="xs"
                                                                wrap="nowrap"
                                                            >
                                                                <Checkbox
                                                                    checked={
                                                                        moduleState.checked
                                                                    }
                                                                    indeterminate={
                                                                        moduleState.indeterminate
                                                                    }
                                                                    onChange={() =>
                                                                        toggleModuleAllPermissions(
                                                                            module.module
                                                                        )
                                                                    }
                                                                    aria-label={`Select all ${module.module} permissions`}
                                                                    styles={{
                                                                        input: moduleState.indeterminate
                                                                            ? {
                                                                                  backgroundColor:
                                                                                      "var(--mantine-color-red-6)",
                                                                                  borderColor:
                                                                                      "var(--mantine-color-red-6)",
                                                                                  "&::before":
                                                                                      {
                                                                                          backgroundColor:
                                                                                              "var(--mantine-color-white)",
                                                                                      },
                                                                              }
                                                                            : undefined,
                                                                    }}
                                                                />
                                                                <Text
                                                                    fw={600}
                                                                    style={{
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                    }}
                                                                >
                                                                    {
                                                                        module.module
                                                                    }
                                                                </Text>
                                                            </Group>
                                                        </Table.Td>
                                                        {permissionColumns.map(
                                                            (action) => (
                                                                <Table.Td
                                                                    key={`drawer-${module.module}-${action}`}
                                                                >
                                                                    {module.actions.includes(
                                                                        action
                                                                    ) ? (
                                                                        <Checkbox
                                                                            aria-label={`${module.module} ${action}`}
                                                                            checked={
                                                                                permissionDraft[
                                                                                    module
                                                                                        .module
                                                                                ]?.includes(
                                                                                    action
                                                                                ) ??
                                                                                false
                                                                            }
                                                                            onChange={() =>
                                                                                togglePermission(
                                                                                    module.module,
                                                                                    action
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Text
                                                                            size="xs"
                                                                            c="dimmed"
                                                                            ta="center"
                                                                        >
                                                                            —
                                                                        </Text>
                                                                    )}
                                                                </Table.Td>
                                                            )
                                                        )}
                                                    </Table.Tr>
                                                );
                                            })}
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                                <Divider my="sm" />
                                <Stack gap="xs">
                                    <Text size="sm" fw={600}>
                                        Current access summary
                                    </Text>
                                    {renderPermissionPreview().filter(Boolean)
                                        .length > 0 ? (
                                        renderPermissionPreview()
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            No permissions selected yet.
                                        </Text>
                                    )}
                                </Stack>
                            </Paper>
                        )}
                        <Group justify="flex-end">
                            <Button
                                variant="default"
                                onClick={closeUserDrawer}
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
                                ) : drawerMode === "edit" ? (
                                    "Save changes"
                                ) : (
                                    "Send invite"
                                )}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            <Drawer
                opened={permissionsDrawerOpened}
                onClose={closePermissionsDrawer}
                position="right"
                size="lg"
                title={
                    <Group gap="xs">
                        <IconShieldCheck size={18} />
                        <Text fw={600}>Update permissions</Text>
                    </Group>
                }
            >
                {activeUser ? (
                    <form onSubmit={handlePermissionsSubmit}>
                        <Stack>
                            <div>
                                <Text fw={600}>{activeUser.name}</Text>
                                <Text size="sm" c="dimmed">
                                    {activeUser.email}
                                </Text>
                            </div>
                            <Box
                                style={{
                                    border: "1px solid var(--mantine-color-gray-3)",
                                    borderRadius: 8,
                                }}
                            >
                                <Table
                                    horizontalSpacing="md"
                                    verticalSpacing="xs"
                                    withColumnBorders
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Module</Table.Th>
                                            {permissionColumns.map((action) => (
                                                <Table.Th
                                                    key={`perm-${action}`}
                                                    style={{
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {action}
                                                </Table.Th>
                                            ))}
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {moduleDefinitions.map((module) => {
                                            const moduleState =
                                                getModulePermissionState(
                                                    module.module
                                                );
                                            return (
                                                <Table.Tr
                                                    key={`perm-${module.module}`}
                                                >
                                                    <Table.Td>
                                                        <Group
                                                            gap="xs"
                                                            wrap="nowrap"
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    moduleState.checked
                                                                }
                                                                indeterminate={
                                                                    moduleState.indeterminate
                                                                }
                                                                onChange={() =>
                                                                    toggleModuleAllPermissions(
                                                                        module.module
                                                                    )
                                                                }
                                                                aria-label={`Select all ${module.module} permissions`}
                                                                styles={{
                                                                    input: {
                                                                        "&:indeterminate":
                                                                            {
                                                                                backgroundColor:
                                                                                    "var(--mantine-color-red-6)",
                                                                                borderColor:
                                                                                    "var(--mantine-color-red-6)",
                                                                            },
                                                                    },
                                                                }}
                                                            />
                                                            <Text
                                                                fw={600}
                                                                style={{
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                }}
                                                            >
                                                                {module.module}
                                                            </Text>
                                                        </Group>
                                                    </Table.Td>
                                                    {permissionColumns.map(
                                                        (action) => (
                                                            <Table.Td
                                                                key={`perm-${module.module}-${action}`}
                                                            >
                                                                {module.actions.includes(
                                                                    action
                                                                ) ? (
                                                                    <Checkbox
                                                                        aria-label={`${module.module} ${action}`}
                                                                        checked={
                                                                            permissionDraft[
                                                                                module
                                                                                    .module
                                                                            ]?.includes(
                                                                                action
                                                                            ) ??
                                                                            false
                                                                        }
                                                                        onChange={() =>
                                                                            togglePermission(
                                                                                module.module,
                                                                                action
                                                                            )
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Text
                                                                        size="xs"
                                                                        c="dimmed"
                                                                        ta="center"
                                                                    >
                                                                        —
                                                                    </Text>
                                                                )}
                                                            </Table.Td>
                                                        )
                                                    )}
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                            <Divider my="sm" />
                            <Stack gap="xs">
                                <Text size="sm" fw={600}>
                                    Current access summary
                                </Text>
                                {renderPermissionPreview().filter(Boolean)
                                    .length > 0 ? (
                                    renderPermissionPreview()
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        No permissions selected yet.
                                    </Text>
                                )}
                            </Stack>
                            <Group justify="flex-end">
                                <Button
                                    variant="default"
                                    onClick={closePermissionsDrawer}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save permissions</Button>
                            </Group>
                        </Stack>
                    </form>
                ) : (
                    <Text size="sm" c="dimmed">
                        Select a user to update permissions.
                    </Text>
                )}
            </Drawer>

            <Drawer
                opened={existingUserDrawerOpened}
                onClose={closeExistingUserDrawer}
                position="right"
                size="lg"
                title={
                    <Group gap="xs">
                        <IconUsersGroup size={18} />
                        <Text fw={600}>Add existing user</Text>
                    </Group>
                }
            >
                <form onSubmit={handleExistingUserSubmit}>
                    <Stack>
                        <Autocomplete
                            label="User"
                            placeholder="Search for user by name or email"
                            leftSection={<IconSearch size={16} />}
                            data={useMemo(() => {
                                const allUsers = existingUsersList.map(
                                    (user) => ({
                                        value: `${user.name} (${user.email})`,
                                        id: user.id,
                                        name: user.name,
                                        email: user.email,
                                    })
                                );
                                // If search is empty, show all users; otherwise filter
                                if (
                                    !existingUsersSearch ||
                                    existingUsersSearch.trim().length === 0
                                ) {
                                    return allUsers;
                                }
                                const searchLower = existingUsersSearch
                                    .toLowerCase()
                                    .trim();
                                return allUsers.filter((user) =>
                                    user.value
                                        .toLowerCase()
                                        .includes(searchLower)
                                );
                            }, [existingUsersList, existingUsersSearch])}
                            value={existingUsersSearch}
                            onChange={(value) => {
                                setExistingUsersSearch(value);
                                // Find selected user from the list
                                const selected = existingUsersList.find(
                                    (u) => `${u.name} (${u.email})` === value
                                );
                                if (selected) {
                                    setSelectedExistingUser(selected);
                                    existingUserForm.setFieldValue(
                                        "userId",
                                        selected.id
                                    );
                                } else {
                                    setSelectedExistingUser(null);
                                    existingUserForm.setFieldValue(
                                        "userId",
                                        ""
                                    );
                                }
                            }}
                            onOptionSubmit={(value) => {
                                const option = existingUsersList.find(
                                    (u) => `${u.name} (${u.email})` === value
                                );
                                if (option) {
                                    setSelectedExistingUser(option);
                                    existingUserForm.setFieldValue(
                                        "userId",
                                        option.id
                                    );
                                }
                            }}
                            onFocus={() => {
                                // Ensure dropdown opens when focused if we have data
                                if (
                                    existingUsersList.length > 0 &&
                                    !existingUsersSearch
                                ) {
                                    // The dropdown will open automatically on focus
                                }
                            }}
                            rightSection={
                                isLoadingExistingUsers ? (
                                    <Loader size="xs" />
                                ) : null
                            }
                            withAsterisk
                            error={existingUserForm.errors.userId}
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
                            {...existingUserForm.getInputProps("roleId")}
                        />
                        <Paper withBorder radius="md" p="md">
                            <div style={{ marginBottom: "1rem" }}>
                                <Text fw={600}>Permissions</Text>
                                <Text size="sm" c="dimmed">
                                    Toggle module access to fine tune this user.
                                </Text>
                            </div>
                            <Box
                                style={{
                                    border: "1px solid var(--mantine-color-gray-3)",
                                    borderRadius: 8,
                                }}
                            >
                                <Table
                                    horizontalSpacing="md"
                                    verticalSpacing="xs"
                                    withColumnBorders
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Module</Table.Th>
                                            {permissionColumns.map((action) => (
                                                <Table.Th
                                                    key={`existing-${action}`}
                                                >
                                                    {action}
                                                </Table.Th>
                                            ))}
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {moduleDefinitions.map((module) => {
                                            const moduleState =
                                                getModulePermissionState(
                                                    module.module
                                                );
                                            return (
                                                <Table.Tr
                                                    key={`existing-${module.module}`}
                                                >
                                                    <Table.Td>
                                                        <Group
                                                            gap="xs"
                                                            wrap="nowrap"
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    moduleState.checked
                                                                }
                                                                indeterminate={
                                                                    moduleState.indeterminate
                                                                }
                                                                onChange={() =>
                                                                    toggleModuleAllPermissions(
                                                                        module.module
                                                                    )
                                                                }
                                                                aria-label={`Select all ${module.module} permissions`}
                                                                styles={{
                                                                    input: moduleState.indeterminate
                                                                        ? {
                                                                              backgroundColor:
                                                                                  "var(--mantine-color-red-6)",
                                                                              borderColor:
                                                                                  "var(--mantine-color-red-6)",
                                                                              "&::before":
                                                                                  {
                                                                                      backgroundColor:
                                                                                          "var(--mantine-color-white)",
                                                                                  },
                                                                          }
                                                                        : undefined,
                                                                }}
                                                            />
                                                            <Text
                                                                fw={600}
                                                                style={{
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                }}
                                                            >
                                                                {module.module}
                                                            </Text>
                                                        </Group>
                                                    </Table.Td>
                                                    {permissionColumns.map(
                                                        (action) => (
                                                            <Table.Td
                                                                key={`existing-${module.module}-${action}`}
                                                            >
                                                                {module.actions.includes(
                                                                    action
                                                                ) ? (
                                                                    <Checkbox
                                                                        aria-label={`${module.module} ${action}`}
                                                                        checked={
                                                                            permissionDraft[
                                                                                module
                                                                                    .module
                                                                            ]?.includes(
                                                                                action
                                                                            ) ??
                                                                            false
                                                                        }
                                                                        onChange={() =>
                                                                            togglePermission(
                                                                                module.module,
                                                                                action
                                                                            )
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Text
                                                                        size="xs"
                                                                        c="dimmed"
                                                                        ta="center"
                                                                    >
                                                                        —
                                                                    </Text>
                                                                )}
                                                            </Table.Td>
                                                        )
                                                    )}
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                            <Divider my="sm" />
                            <Stack gap="xs">
                                <Text size="sm" fw={600}>
                                    Current access summary
                                </Text>
                                {renderPermissionPreview().filter(Boolean)
                                    .length > 0 ? (
                                    renderPermissionPreview()
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        No permissions selected yet.
                                    </Text>
                                )}
                            </Stack>
                        </Paper>
                        <Group justify="flex-end">
                            <Button
                                variant="default"
                                onClick={closeExistingUserDrawer}
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
        </Stack>
    );
}

export default UserManagementPage;
