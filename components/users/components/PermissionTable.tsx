"use client";

import { Box, Checkbox, Group, Table, Text } from "@mantine/core";
import type { ModuleDefinition, PermissionMatrix } from "../types";

interface PermissionTableProps {
    moduleDefinitions: ModuleDefinition[];
    permissionColumns: string[];
    permissionDraft: PermissionMatrix;
    onTogglePermission: (moduleName: string, action: string) => void;
    onToggleModuleAll: (moduleName: string) => void;
    getModulePermissionState: (moduleName: string) => {
        checked: boolean;
        indeterminate: boolean;
    };
}

export default function PermissionTable({
    moduleDefinitions,
    permissionColumns,
    permissionDraft,
    onTogglePermission,
    onToggleModuleAll,
    getModulePermissionState,
}: PermissionTableProps) {
    return (
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
                            <Table.Th key={action}>{action}</Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {moduleDefinitions.map((module) => {
                        const moduleState = getModulePermissionState(module.module);
                        return (
                            <Table.Tr key={module.module}>
                                <Table.Td>
                                    <Group gap="xs" wrap="nowrap">
                                        <Checkbox
                                            checked={moduleState.checked}
                                            indeterminate={moduleState.indeterminate}
                                            onChange={() => onToggleModuleAll(module.module)}
                                            aria-label={`Select all ${module.module} permissions`}
                                            styles={{
                                                input: moduleState.indeterminate
                                                    ? {
                                                          backgroundColor:
                                                              "var(--mantine-color-red-6)",
                                                          borderColor:
                                                              "var(--mantine-color-red-6)",
                                                          "&::before": {
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
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {module.module}
                                        </Text>
                                    </Group>
                                </Table.Td>
                                {permissionColumns.map((action) => (
                                    <Table.Td key={`${module.module}-${action}`}>
                                        {module.actions.includes(action) ? (
                                            <Checkbox
                                                aria-label={`${module.module} ${action}`}
                                                checked={
                                                    permissionDraft[module.module]?.includes(
                                                        action
                                                    ) ?? false
                                                }
                                                onChange={() =>
                                                    onTogglePermission(module.module, action)
                                                }
                                            />
                                        ) : (
                                            <Text size="xs" c="dimmed" ta="center">
                                                —
                                            </Text>
                                        )}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Box>
    );
}

