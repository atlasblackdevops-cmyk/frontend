"use client";

import {
    Avatar,
    Badge,
    Button,
    Group,
    Loader,
    Table,
    Text,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { AnimalRecord } from "../types";
import { formatDate } from "@/lib/livestock/utils";
import AnimalActionsMenu from "./AnimalActionsMenu";

interface AnimalTableProps {
    animals: AnimalRecord[];
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (animal: AnimalRecord) => void;
    onDelete: (animal: AnimalRecord) => void;
    onOpenHealthRecords: (animal: AnimalRecord) => void;
    onOpenWeightRecords: (animal: AnimalRecord) => void;
    onOpenFeedRecords: (animal: AnimalRecord) => void;
}

export default function AnimalTable({
    animals,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onOpenHealthRecords,
    onOpenWeightRecords,
    onOpenFeedRecords,
}: AnimalTableProps) {
    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{
                    width: "100%",
                    minWidth: 720,
                    tableLayout: "fixed",
                }}
            >
                <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "25%" }} />
                </colgroup>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Animal</Table.Th>
                        <Table.Th>Species</Table.Th>
                        <Table.Th>Breed</Table.Th>
                        <Table.Th>Sex</Table.Th>
                        <Table.Th>Birthdate</Table.Th>
                        <Table.Th
                            style={{
                                textAlign: "right",
                            }}
                        >
                            Actions
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {isLoading ? (
                        <Table.Tr>
                            <Table.Td colSpan={6}>
                                <Group justify="center" p="xl">
                                    <Loader size="sm" />
                                    <Text c="dimmed">Loading animals...</Text>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ) : animals.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={6}>
                                <Text c="dimmed" ta="center">
                                    No animals found. Use "Add animal" to create
                                    your first entry or adjust your search
                                    filters.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        animals.map((animal) => (
                            <Table.Tr key={animal.id}>
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar
                                            src={animal.photo}
                                            radius="xl"
                                            size={42}
                                        >
                                            {!animal.photo &&
                                                animal.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <Text fw={600}>{animal.name}</Text>
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>{animal.species}</Table.Td>
                                <Table.Td>{animal.breed}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            animal.gender === "Female"
                                                ? "pink"
                                                : animal.gender === "Male"
                                                  ? "blue"
                                                  : "gray"
                                        }
                                    >
                                        {animal.gender}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    {formatDate(animal.birthdate)}
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        textAlign: "right",
                                    }}
                                >
                                    <Group gap="xs" justify="flex-end">
                                        {(canUpdate || canDelete) && (
                                            <>
                                                {canUpdate && (
                                                    <Button
                                                        variant="subtle"
                                                        size="xs"
                                                        leftSection={
                                                            <IconEdit size={14} />
                                                        }
                                                        onClick={() =>
                                                            onUpdate(animal)
                                                        }
                                                    >
                                                        Update
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="subtle"
                                                        color="red"
                                                        size="xs"
                                                        leftSection={
                                                            <IconTrash size={14} />
                                                        }
                                                        onClick={() =>
                                                            onDelete(animal)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        <AnimalActionsMenu
                                            animal={animal}
                                            onOpenHealthRecords={() =>
                                                onOpenHealthRecords(animal)
                                            }
                                            onOpenWeightRecords={() =>
                                                onOpenWeightRecords(animal)
                                            }
                                            onOpenFeedRecords={() =>
                                                onOpenFeedRecords(animal)
                                            }
                                        />
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </div>
    );
}

