"use client";

import { Paper, SimpleGrid, Text } from "@mantine/core";
import type { ManagedUser, PaginationInfo } from "../types";

interface UserStatsProps {
    users: ManagedUser[];
    pagination: PaginationInfo;
}

export default function UserStats({ users, pagination }: UserStatsProps) {
    const total = pagination.total || users.length;
    const active = users.filter((user) => user.status === "active").length;
    const inactive = users.filter((user) => user.status === "inactive").length;

    const stats = [
        { label: "Total users", value: total, accent: "blue" },
        { label: "Active users", value: active, accent: "teal" },
        { label: "Inactive users", value: inactive, accent: "orange" },
    ];

    return (
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
    );
}

