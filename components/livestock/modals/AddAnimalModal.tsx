"use client";

import { useState } from "react";
import {
    Avatar,
    Button,
    FileInput,
    Group,
    Modal,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import type { AddAnimalValues } from "../types";
import { GENDER_OPTIONS } from "../types";

interface AddAnimalModalProps {
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
}

export default function AddAnimalModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: AddAnimalModalProps) {
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

    const resetAndClose = () => {
        form.reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleFileChange = (file: File | null) => {
        form.setFieldValue("photo", file);
        if (!file) {
            setPhotoPreview(null);
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
            title="Add animal"
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name.trim(),
                        species: values.species.trim(),
                        breed: values.breed.trim(),
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
                    <TextInput
                        label="Name"
                        placeholder="e.g. Daisy"
                        required
                        {...form.getInputProps("name")}
                    />
                    <TextInput
                        label="Species"
                        placeholder="e.g. Cattle"
                        required
                        {...form.getInputProps("species")}
                    />
                    <TextInput
                        label="Breed"
                        placeholder="e.g. Jersey"
                        required
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
                    <TextInput
                        label="Birthdate"
                        type="date"
                        required
                        {...form.getInputProps("birthdate")}
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
                            Save animal
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

