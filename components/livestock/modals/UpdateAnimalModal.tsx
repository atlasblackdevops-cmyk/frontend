"use client";

import { useState, useEffect } from "react";
import {
    Avatar,
    Button,
    FileInput,
    Group,
    Modal,
    Select,
    Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { BaseInput, BaseDateInput, BaseSelect } from "@/components/ui";
import type { AddAnimalValues, AnimalRecord } from "../types";
import { GENDER_OPTIONS } from "../types";
import { getSpecies, getBreeds, type Species, type Breed } from "@/lib/livestock/api";

interface UpdateAnimalModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
}

export default function UpdateAnimalModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
}: UpdateAnimalModalProps) {
    const form = useForm<AddAnimalValues>({
        initialValues: {
            name: "",
            species: "",
            breed: "",
            gender: "",
            birthdate: "",
            photo: null,
        },
        validate: {
            name: (value) =>
                value.trim().length < 2
                    ? "Name must be at least 2 characters"
                    : null,
            species: (value) =>
                value.trim().length === 0 ? "Species is required" : null,
            breed: (value) =>
                value.trim().length === 0 ? "Breed is required" : null,
            gender: (value) => (!value ? "Select sex / gender" : null),
            birthdate: (value) => (!value ? "Birthdate is required" : null),
        },
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [breedsList, setBreedsList] = useState<Breed[]>([]);
    const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);

    // Fetch species on mount
    useEffect(() => {
        if (opened) {
            fetchSpecies();
        }
    }, [opened]);

    // Load animal data when modal opens and species are loaded
    useEffect(() => {
        if (opened && animal && speciesList.length > 0 && !isInitialLoad) {
            setIsInitialLoad(true);
            
            // Find species by name
            const foundSpecies = speciesList.find(
                (s) => s.name.toLowerCase() === animal.species.toLowerCase()
            );
            
            if (foundSpecies) {
                form.setValues({
                    name: animal.name,
                    species: foundSpecies.id,
                    breed: "", // Will be set after breeds are loaded
                    gender: animal.gender,
                    birthdate: animal.birthdate,
                    photo: null,
                });
                setPhotoPreview(animal.photo);
                
                // Fetch breeds for the found species
                fetchBreeds(foundSpecies.id, animal.breed);
            } else {
                // If species not found, set values as is (fallback)
                form.setValues({
                    name: animal.name,
                    species: animal.species,
                    breed: animal.breed,
                    gender: animal.gender,
                    birthdate: animal.birthdate,
                    photo: null,
                });
                setPhotoPreview(animal.photo);
            }
        } else if (!opened) {
            // Reset form when modal closes
            form.reset();
            setPhotoPreview(null);
            setBreedsList([]);
            setIsInitialLoad(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, animal?.id, speciesList]);

    // Fetch breeds when species changes (for manual changes only)
    useEffect(() => {
        const selectedSpecies = form.values.species;
        if (selectedSpecies && opened && isInitialLoad) {
            // Only fetch if species was manually changed (after initial load)
            fetchBreeds(selectedSpecies);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.species]);

    const fetchSpecies = async () => {
        setIsLoadingSpecies(true);
        try {
            const species = await getSpecies();
            setSpeciesList(species);
        } catch (error) {
            console.error("Failed to fetch species:", error);
            setSpeciesList([]);
        } finally {
            setIsLoadingSpecies(false);
        }
    };

    const fetchBreeds = async (speciesId: string, breedNameToMatch?: string) => {
        setIsLoadingBreeds(true);
        try {
            const breeds = await getBreeds(speciesId);
            setBreedsList(breeds);
            
            // If breedNameToMatch is provided, find and set the breed ID
            if (breedNameToMatch && breeds.length > 0) {
                const foundBreed = breeds.find(
                    (b) => b.name.toLowerCase() === breedNameToMatch.toLowerCase()
                );
                if (foundBreed) {
                    form.setFieldValue("breed", foundBreed.id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch breeds:", error);
            setBreedsList([]);
        } finally {
            setIsLoadingBreeds(false);
        }
    };

    const resetAndClose = () => {
        form.reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleFileChange = (file: File | null) => {
        form.setFieldValue("photo", file);
        if (!file) {
            // If clearing file, restore original photo if exists
            setPhotoPreview(animal?.photo || null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update animal"
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name.trim(),
                        species: values.species,
                        breed: values.breed,
                        gender: values.gender,
                        birthdate: values.birthdate,
                        photo: values.photo,
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <Group align="flex-end" gap="md">
                        <Avatar
                            src={photoPreview}
                            size={72}
                            radius="md"
                            variant="light"
                        >
                            {!photoPreview &&
                                (form.values.name?.[0]?.toUpperCase() || (
                                    <IconPhoto size={32} />
                                ))}
                        </Avatar>
                        <FileInput
                            label="Photo"
                            placeholder="Upload animal photo"
                            leftSection={<IconUpload size={16} />}
                            accept="image/png,image/jpeg,image/webp"
                            value={form.values.photo}
                            onChange={handleFileChange}
                            clearable
                        />
                    </Group>
                    <BaseInput
                        label="Name"
                        placeholder="e.g. Daisy"
                        required
                        {...form.getInputProps("name")}
                    />
                    <BaseSelect
                        label="Species"
                        placeholder="Select species"
                        data={speciesList.map((species) => ({
                            value: species.id,
                            label: species.name,
                        }))}
                        required
                        loading={isLoadingSpecies}
                        searchable
                        {...form.getInputProps("species")}
                        onChange={(value) => {
                            form.setFieldValue("species", value || "");
                            form.setFieldValue("breed", "");
                            if (value && isInitialLoad) {
                                fetchBreeds(value);
                            } else if (!value) {
                                setBreedsList([]);
                            }
                        }}
                    />
                    <BaseSelect
                        label="Breed"
                        placeholder="Select breed"
                        data={breedsList.map((breed) => ({
                            value: breed.id,
                            label: breed.name,
                        }))}
                        required
                        loading={isLoadingBreeds}
                        disabled={!form.values.species || isLoadingBreeds}
                        searchable
                        {...form.getInputProps("breed")}
                    />
                    <Select
                        label="Sex / gender"
                        placeholder="Select"
                        data={GENDER_OPTIONS.filter(
                            (opt) => opt.value !== "all"
                        )}
                        required
                        {...form.getInputProps("gender")}
                    />
                    <BaseDateInput
                        label="Birthdate"
                        placeholder="Select birthdate"
                        required
                        clearable
                        value={form.values.birthdate || ""}
                        onChange={(date) => {
                            form.setFieldValue("birthdate", date || "");
                        }}
                    />
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Update animal
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
