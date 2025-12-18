"use client";

import { useState } from "react";
import {
    Button,
    Group,
    Modal,
    NumberInput,
    Stack,
    FileButton,
    SimpleGrid,
    Image,
    ActionIcon,
    Text,
    Paper,
    Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { BaseInput, BaseDateInput, BaseTextarea } from "@/components/ui";
import type { HealthRecordValues, AnimalRecord } from "../types";

const MAX_IMAGES = 10;

interface HealthRecordModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        type: string;
        name: string;
        cost: number | null;
        nextDueDate: string | null;
        description: string | null;
        images: File[];
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
}

export default function HealthRecordModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
}: HealthRecordModalProps) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);

    const form = useForm<HealthRecordValues>({
        initialValues: {
            type: "",
            name: "",
            cost: "",
            nextDueDate: "",
            description: "",
        },
        validate: {
            type: (value) =>
                value.trim().length === 0 ? "Type is required" : null,
            name: (value) =>
                value.trim().length === 0 ? "Name is required" : null,
            cost: (value) => {
                if (value !== "" && value !== null && value !== undefined) {
                    if (typeof value === "number" && value < 0) {
                        return "Cost must be a positive number";
                    }
                }
                return null;
            },
        },
    });

    const handleImageSelect = (files: File[] | null) => {
        if (!files || files.length === 0) return;
        setImageError(null);

        const currentImageCount = imageFiles.length;
        const remainingSlots = MAX_IMAGES - currentImageCount;

        if (remainingSlots <= 0) {
            setImageError(
                `Maximum ${MAX_IMAGES} images allowed per health record.`
            );
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];
        let filesRejectedDueToLimit = 0;

        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                return;
            }

            // Validate file size (max 10MB per image)
            if (file.size > 10 * 1024 * 1024) {
                return;
            }

            // Check if adding this file would exceed the limit
            if (validFiles.length >= remainingSlots) {
                filesRejectedDueToLimit++;
                return;
            }

            validFiles.push(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews((prev) => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Only show error if some files were rejected due to limit
        if (filesRejectedDueToLimit > 0) {
            const newTotal = currentImageCount + validFiles.length;
            const newRemaining = MAX_IMAGES - newTotal;
            if (newRemaining <= 0) {
                setImageError(
                    `Maximum ${MAX_IMAGES} images allowed per health record. Added ${validFiles.length} image(s), but ${filesRejectedDueToLimit} image(s) were not added.`
                );
            } else {
                setImageError(
                    `Added ${validFiles.length} image(s). Only ${newRemaining} more image(s) can be added. ${filesRejectedDueToLimit} image(s) were not added.`
                );
            }
        }

        setImageFiles((prev) => [...prev, ...validFiles]);
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const resetAndClose = () => {
        form.reset();
        setImageFiles([]);
        setImagePreviews([]);
        setImageError(null);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title={`Health Record - ${animal?.name || ""}`}
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    setImageError(null);
                    if (imageFiles.length > MAX_IMAGES) {
                        setImageError(
                            `Maximum ${MAX_IMAGES} images allowed per health record.`
                        );
                        return;
                    }
                    try {
                        await onSubmit({
                            type: values.type.trim(),
                            name: values.name.trim(),
                            cost:
                                typeof values.cost === "number"
                                    ? values.cost
                                    : null,
                            nextDueDate: values.nextDueDate || null,
                            description: values.description.trim() || null,
                            images: imageFiles,
                        });
                        resetAndClose();
                    } catch (error: any) {
                        // Error is handled by parent component, but we don't close modal on error
                        throw error;
                    }
                })}
            >
                <Stack gap="md">
                    <BaseInput
                        label="Type"
                        placeholder="e.g. Vaccination, Treatment"
                        required
                        {...form.getInputProps("type")}
                    />
                    <BaseInput
                        label="Name"
                        placeholder="e.g. Annual Checkup"
                        required
                        {...form.getInputProps("name")}
                    />
                    <NumberInput
                        label="Cost"
                        placeholder="Enter cost"
                        prefix="$"
                        decimalScale={2}
                        {...form.getInputProps("cost")}
                    />
                    <BaseDateInput
                        label="Next due date"
                        placeholder="Select date"
                        value={form.values.nextDueDate}
                        clearable
                        onChange={(date) => {
                                form.setFieldValue("nextDueDate", date ||'');
                        }}
                    />
                    <BaseTextarea
                        label="Description"
                        placeholder="Enter description"
                        rows={4}
                        {...form.getInputProps("description")}
                    />

                    {/* Image Upload Section */}
                    <Paper withBorder p="md" radius="md">
                        <Stack gap="sm">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" fw={500}>
                                        Images (Optional)
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {imageFiles.length} / {MAX_IMAGES}{" "}
                                        images
                                    </Text>
                                </div>
                                <FileButton
                                    onChange={handleImageSelect}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    disabled={imageFiles.length >= MAX_IMAGES}
                                >
                                    {(props) => (
                                        <Button
                                            {...props}
                                            size="xs"
                                            variant="light"
                                            leftSection={
                                                <IconPhoto size={16} />
                                            }
                                            type="button"
                                            disabled={
                                                imageFiles.length >= MAX_IMAGES
                                            }
                                        >
                                            Add Images
                                        </Button>
                                    )}
                                </FileButton>
                            </Group>
                            {imagePreviews.length > 0 && (
                                <SimpleGrid cols={6} spacing="xs">
                                    {imagePreviews.map((preview, index) => (
                                        <Box
                                            key={index}
                                            pos="relative"
                                            style={{
                                                aspectRatio: "1",
                                                borderRadius:
                                                    "var(--mantine-radius-sm)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Image
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                fit="cover"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            />
                                            <ActionIcon
                                                variant="filled"
                                                color="red"
                                                size="xs    "
                                                radius="xl"
                                                onClick={() =>
                                                    handleRemoveImage(index)
                                                }
                                                style={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                }}
                                            >
                                                <IconX size={12} />
                                            </ActionIcon>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}
                            {imagePreviews.length === 0 && !imageError && (
                                <Text size="xs" c="dimmed" ta="center" py="xs">
                                    No images selected. Click "Add Images" to
                                    upload.
                                </Text>
                            )}
                            {imageError && (
                                <Text size="xs" c="red" ta="center" py="xs">
                                    {imageError}
                                </Text>
                            )}
                        </Stack>
                    </Paper>

                    <Group justify="flex-end" mt="sm">
                        <Button
                            type="button"
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Save health record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
