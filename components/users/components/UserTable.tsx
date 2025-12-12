"use client";

import {
    ActionIcon,
    Avatar,
    Badge,
    Group,
    Menu,
    Stack,
    Switch,
    Text,
} from "@mantine/core";
import {
    IconDotsVertical,
    IconShieldCheck,
    IconUserEdit,
    IconUsers,
} from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import type { ManagedUser, PaginationInfo } from "../types";

interface UserTableProps {
    users: ManagedUser[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    getRoleLabel: (roleId: string) => string;
    onStatusToggle: (userId: string, checked: boolean) => void;
    onUpdateUser: (user: ManagedUser) => void;
    onUpdatePermissions: (user: ManagedUser) => void;
    onPageChange?: (page: number) => void;
}

export default function UserTable({
    users,
    pagination,
    isLoading,
    getRoleLabel,
    onStatusToggle,
    onUpdateUser,
    onUpdatePermissions,
    onPageChange,
}: UserTableProps) {
    const columns: BaseTableColumn<ManagedUser>[] = [
        {
            key: "user",
            label: "User",
            width: "30%",
            render: (user) => (
                <Group gap="md">
                    <Avatar color={user.avatarColor} radius="xl">
                        {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                    </Avatar>
                    <div>
                        <Text fw={600}>{user.name}</Text>
                        <Text size="sm" c="dimmed">
                            {user.email}
                        </Text>
                    </div>
                </Group>
            ),
        },
        {
            key: "role",
            label: "Role",
            width: "15%",
            render: (user) => (
                <Badge color="gray" variant="light">
                    {getRoleLabel(user.roleId)}
                </Badge>
            ),
        },
        {
            key: "modules",
            label: "Modules",
            width: "25%",
            render: (user) => (
                <Group gap="xs">
                    {Object.entries(user.permissions)
                        .filter(([, actions]) => actions.length > 0)
                        .slice(0, 3)
                        .map(([moduleName]) => (
                            <Badge
                                key={`${user.id}-${moduleName}`}
                                size="sm"
                                variant="outline"
                            >
                                {moduleName}
                            </Badge>
                        ))}
                    {Object.entries(user.permissions).filter(
                        ([, actions]) => actions.length > 0
                    ).length > 3 && (
                        <Text size="sm" c="dimmed">
                            + more
                        </Text>
                    )}
                </Group>
            ),
        },
        {
            key: "status",
            label: "Status",
            width: "15%",
            render: (user) => (
                <Stack gap={0}>
                    <Switch
                        checked={user.status === "active"}
                        onChange={(event) =>
                            onStatusToggle(
                                user.id,
                                event.currentTarget.checked
                            )
                        }
                        color="teal"
                        size="md"
                    />
                    <Text size="xs" c="dimmed">
                        {user.status}
                    </Text>
                </Stack>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "15%",
            render: (user) => (
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
                            leftSection={<IconUserEdit size={16} />}
                            onClick={() => onUpdateUser(user)}
                        >
                            Update user
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconShieldCheck size={16} />}
                            onClick={() => onUpdatePermissions(user)}
                        >
                            Manage permissions
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyState={{
                icon: IconUsers,
                title: "No Users Found",
                description: "You haven't added any users yet. Start by adding your first user to manage permissions and access.",
                iconColor: "var(--mantine-color-blue-5)",
            }}
            stickyHeader={true}
            minWidth={800}
            colgroup={[
                { width: "30%" }, { width: "15%" }, { width: "25%" }, { width: "15%" }, { width: "15%" }
            ]}
            pagination={
                pagination
                    ? {
                          page: pagination.page,
                          totalPages: pagination.totalPages,
                          onPageChange: onPageChange ?? (() => {}),
                      }
                    : undefined
            }
        />
    );
}

