"use client";

import {
    ActionIcon,
    Avatar,
    Badge,
    Group,
    Loader,
    Menu,
    ScrollArea,
    Stack,
    Switch,
    Table,
    Text,
} from "@mantine/core";
import {
    IconDotsVertical,
    IconShieldCheck,
    IconUserEdit,
} from "@tabler/icons-react";
import type { ManagedUser } from "../types";

interface UserTableProps {
    users: ManagedUser[];
    isLoading: boolean;
    getRoleLabel: (roleId: string) => string;
    onStatusToggle: (userId: string, checked: boolean) => void;
    onUpdateUser: (user: ManagedUser) => void;
    onUpdatePermissions: (user: ManagedUser) => void;
}

export default function UserTable({
    users,
    isLoading,
    getRoleLabel,
    onStatusToggle,
    onUpdateUser,
    onUpdatePermissions,
}: UserTableProps) {
    if (isLoading) {
        return (
            <Group justify="center" p="xl">
                <Loader size="lg" />
            </Group>
        );
    }

    return (
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
                                <Text ta="center" c="dimmed" py="xl">
                                    No users found
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        users.map((user) => (
                            <Table.Tr key={user.id}>
                                <Table.Td>
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
                                </Table.Td>
                                <Table.Td>
                                    <Badge color="gray" variant="light">
                                        {getRoleLabel(user.roleId)}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
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
                                </Table.Td>
                                <Table.Td>
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
                                                leftSection={
                                                    <IconShieldCheck size={16} />
                                                }
                                                onClick={() =>
                                                    onUpdatePermissions(user)
                                                }
                                            >
                                                Manage permissions
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
    );
}

