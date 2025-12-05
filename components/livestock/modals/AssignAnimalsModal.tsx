"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Group,
    Modal,
    Stack,
    Text,
    MultiSelect,
    Loader,
    Center,
    Paper,
    Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconDeer } from "@tabler/icons-react";
import type { AssignAnimalsValues, AnimalRecord } from "../types";

interface AssignAnimalsModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AssignAnimalsValues) => Promise<void>;
    isSubmitting: boolean;
    availableAnimals: AnimalRecord[];
    currentAnimalIds: string[];
    isLoadingAnimals: boolean;
}

export default function AssignAnimalsModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    availableAnimals,
    currentAnimalIds,
    isLoadingAnimals,
}: AssignAnimalsModalProps) {
    const form = useForm<AssignAnimalsValues>({
        initialValues: {
            animalIds: [],
        },
        validate: {
            animalIds: (value) => null, // Allow empty to remove all animals
        },
    });

    // Initialize form with current animal IDs when modal opens
    useEffect(() => {
        if (opened) {
            form.setFieldValue("animalIds", currentAnimalIds);
        }
    }, [opened, currentAnimalIds]);

    const resetAndClose = () => {
        form.reset();
        onClose();
    };

    // Prepare options for MultiSelect
    const animalOptions = availableAnimals.map((animal) => ({
        value: animal.id,
        label: `${animal.name} (${animal.species} - ${animal.breed})`,
    }));

    const selectedAnimals = availableAnimals.filter((animal) =>
        form.values.animalIds.includes(animal.id)
    );

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Assign Animals to Group"
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit(values);
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    {isLoadingAnimals ? (
                        <Center p="xl">
                            <Stack align="center" gap="md">
                                <Loader size="sm" />
                                <Text c="dimmed">Loading animals...</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <>
                            <MultiSelect
                                label="Select Animals"
                                placeholder="Choose animals for this group"
                                data={animalOptions}
                                searchable
                                clearable
                                description={`Select animals to assign to this group. Deselect animals to remove them. ${availableAnimals.length} animals available.`}
                                {...form.getInputProps("animalIds")}
                            />

                            {selectedAnimals.length > 0 && (
                                <Paper withBorder p="md" radius="md">
                                    <Stack gap="xs">
                                        <Text size="sm" fw={600}>
                                            Selected Animals (
                                            {selectedAnimals.length})
                                        </Text>
                                        <Group gap="xs">
                                            {selectedAnimals.map((animal) => (
                                                <Badge
                                                    key={animal.id}
                                                    variant="light"
                                                    leftSection={
                                                        <IconDeer size={12} />
                                                    }
                                                >
                                                    {animal.name}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Stack>
                                </Paper>
                            )}
                        </>
                    )}

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Assign Animals
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
