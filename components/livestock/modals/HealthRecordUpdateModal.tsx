"use client";

import { useEffect, useState } from "react";
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
import type { HealthRecordValues, AnimalRecord, HealthRecord } from "../types";

const MAX_IMAGES = 10;

interface HealthRecordUpdateModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        type: string;
        name: string;
        cost: number | null;
        nextDueDate: string | null;
        description: string | null;
        images?: File[]; // New images to add
        deletedImageKeys?: string[]; // Image keys to delete
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
    record: HealthRecord;
}

export default function HealthRecordUpdateModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
    record,
}: HealthRecordUpdateModalProps) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<
        { id: string; imageKey: string; imageUrl: string }[]
    >([]);
    const [deletedImageKeys, setDeletedImageKeys] = useState<string[]>([]); // Track image keys to delete
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

    useEffect(() => {
        if (opened && record) {
            form.setValues({
                type: record.recordType || "",
                name: record.name || "",
                cost:
                    record.cost === null || record.cost === undefined
                        ? ""
                        : typeof record.cost === "string"
                          ? record.cost === ""
                              ? ""
                              : Number(record.cost)
                          : record.cost,
                nextDueDate: record.nextDueDate
                    ? record.nextDueDate.split("T")[0]
                    : "",
                description: record.description || "",
            });
            // Set existing images (from API response format)
            setExistingImages(record.images || []);
            setImageFiles([]);
            setImagePreviews([]);
            setDeletedImageKeys([]);
            setImageError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, record?.id]);

    const handleImageSelect = (files: File[] | null) => {
        if (!files || files.length === 0) return;
        setImageError(null);

        const currentExistingCount = existingImages.length;
        const currentNewCount = imageFiles.length;
        const totalCurrentImages = currentExistingCount + currentNewCount;
        const remainingSlots = MAX_IMAGES - totalCurrentImages;

        if (remainingSlots <= 0) {
            setImageError(
                `Maximum ${MAX_IMAGES} images allowed per health record. Currently have ${totalCurrentImages} image(s).`
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
            // Use > instead of >= to allow exactly remainingSlots files
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

        // Show error if some files were rejected due to limit
        if (filesRejectedDueToLimit > 0) {
            const newTotal =
                currentExistingCount + currentNewCount + validFiles.length;
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

        // Update state after error is set
        setImageFiles((prev) => [...prev, ...validFiles]);
    };

    const handleRemoveNewImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (imageObj: {
        id: string;
        imageKey: string;
        imageUrl: string;
    }) => {
        // Remove from UI
        setExistingImages((prev) =>
            prev.filter((img) => img.id !== imageObj.id)
        );
        // Track the image key to delete
        setDeletedImageKeys((prev) => [...prev, imageObj.imageKey]);
    };

    const resetAndClose = () => {
        form.reset();
        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);
        setDeletedImageKeys([]);
        setImageError(null);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title={`Update Health Record - ${animal?.name || ""}`}
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    setImageError(null);
                    // Calculate final image count after deletions
                    const finalExistingCount = existingImages.length;
                    const finalNewCount = imageFiles.length;
                    const totalFinalImages = finalExistingCount + finalNewCount;

                    if (totalFinalImages > MAX_IMAGES) {
                        setImageError(
                            `Maximum ${MAX_IMAGES} images allowed per health record. Currently would have ${totalFinalImages} image(s).`
                        );
                        return;
                    }

                    try {
                        // API behavior:
                        // - If deletedImageKeys is provided: delete those specific images
                        // - If images is provided: add new images
                        // - Both can be used together: delete specific images and add new ones
                        // - If neither is provided: existing images remain unchanged
                        await onSubmit({
                            type: values.type.trim(),
                            name: values.name.trim(),
                            cost:
                                typeof values.cost === "number"
                                    ? values.cost
                                    : null,
                            nextDueDate: values.nextDueDate || null,
                            description: values.description.trim() || null,
                            images:
                                imageFiles.length > 0 ? imageFiles : undefined,
                            deletedImageKeys:
                                deletedImageKeys.length > 0
                                    ? deletedImageKeys
                                    : undefined,
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
                                        {existingImages.length +
                                            imageFiles.length}{" "}
                                        / {MAX_IMAGES} images
                                    </Text>
                                </div>
                                <FileButton
                                    onChange={handleImageSelect}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    disabled={
                                        existingImages.length +
                                            imageFiles.length >=
                                        MAX_IMAGES
                                    }
                                >
                                    {(props) => (
                                        <Button
                                            {...props}
                                            size="xs"
                                            variant="light"
                                            leftSection={
                                                <IconPhoto size={16} />
                                            }
                                            disabled={
                                                existingImages.length +
                                                    imageFiles.length >=
                                                MAX_IMAGES
                                            }
                                        >
                                            Add Images
                                        </Button>
                                    )}
                                </FileButton>
                            </Group>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <Box>
                                    <Text size="xs" c="dimmed" mb="xs">
                                        Existing Images
                                        {imageFiles.length > 0 && (
                                            <Text
                                                component="span"
                                                c="blue"
                                                size="xs"
                                                ml="xs"
                                            >
                                                (New images will be added)
                                            </Text>
                                        )}
                                    </Text>
                                    <SimpleGrid cols={4} spacing="xs">
                                        {existingImages.map(
                                            (imageObj, index) => (
                                                <Box
                                                    key={imageObj.id}
                                                    pos="relative"
                                                    style={{
                                                        aspectRatio: "1",
                                                        borderRadius:
                                                            "var(--mantine-radius-sm)",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <Image
                                                        src={imageObj.imageUrl}
                                                        alt={`Existing image ${index + 1}`}
                                                        fit="cover"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    />
                                                    <ActionIcon
                                                        variant="filled"
                                                        color="red"
                                                        size="sm"
                                                        radius="xl"
                                                        onClick={() =>
                                                            handleRemoveExistingImage(
                                                                imageObj
                                                            )
                                                        }
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: 4,
                                                            right: 4,
                                                        }}
                                                    >
                                                        <IconX size={14} />
                                                    </ActionIcon>
                                                </Box>
                                            )
                                        )}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {/* New Images */}
                            {imagePreviews.length > 0 && (
                                <Box>
                                    {existingImages.length > 0 && (
                                        <Text size="xs" c="dimmed" mb="xs">
                                            New Images
                                        </Text>
                                    )}
                                    <SimpleGrid cols={4} spacing="xs">
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
                                                    size="sm"
                                                    radius="xl"
                                                    onClick={() =>
                                                        handleRemoveNewImage(
                                                            index
                                                        )
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        top: 4,
                                                        right: 4,
                                                    }}
                                                >
                                                    <IconX size={14} />
                                                </ActionIcon>
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {existingImages.length === 0 &&
                                imagePreviews.length === 0 &&
                                !imageError && (
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        ta="center"
                                        py="xs"
                                    >
                                        No images selected. Click "Add Images"
                                        to upload.
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
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Update health record
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
