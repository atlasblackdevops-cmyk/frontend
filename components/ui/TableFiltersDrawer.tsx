"use client";

import { Drawer, Stack, Group, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { ReactNode } from "react";

interface TableFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    children: ReactNode;
    title?: string;
}


export default function TableFiltersDrawer({
    opened,
    onClose,
    onApply,
    onClear,
    children,
    title = "Filters",
}: TableFiltersDrawerProps) {
    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="md"
            title={
                <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="xs" align="center" wrap="nowrap">
                        <IconFilter size={20} />
                        <span style={{ fontWeight: 600, fontSize: 20 }}>{title}</span>
                    </Group>
                </Group>
            }
            styles={{
                header: { padding: "12px 4px", margin: 0, position: "sticky", top: 0, background: "white", zIndex: 1 },
                title: { margin: 0, padding: 0 },
                content: { display: "flex", flexDirection: "column", height: "100%" },
                body: { padding: "0 4px 0px 4px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 0, height: "100%" },
            }}
        >
            <Stack gap="md" style={{ flex: 1, overflowY: "auto", paddingTop: 12 }}>
                {children}
            </Stack>

            <Group justify="flex-end" mt="md" style={{ position: "sticky", bottom: 0, background: "white", padding: "12px 16px 0 16px", borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                <Button variant="default" onClick={onClear}>
                    Clear All
                </Button>
                <Button onClick={onApply}>Apply Filters</Button>
            </Group>
        </Drawer>
    );
}

