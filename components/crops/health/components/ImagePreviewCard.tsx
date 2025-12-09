"use client";

import React, { useState, useEffect } from "react";
import {
    Paper,
    Stack,
    TextInput,
    Button,
    Group,
    Image,
    Text,
    Loader,
    Modal,
    ActionIcon,
} from "@mantine/core";
import { IconX, IconPhoto, IconChevronLeft, IconChevronRight, IconMaximize } from "@tabler/icons-react";
import type { ImagePreviewCardProps, CropHealthImage } from "../types";

export function ImagePreviewCard({
    image,
    index,
    note,
    onNoteChange,
    onRemove,
    isUploading = false,
}: ImagePreviewCardProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Handle both File objects and CropHealthImage objects
    const isFile = image instanceof File;
    const imageUrl = isFile ? null : (image as CropHealthImage).url;
    const imageKey = isFile ? null : (image as CropHealthImage).key;

    // Create preview for File objects
    React.useEffect(() => {
        if (isFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(image as File);
        }
    }, [isFile, image]);

    const displayUrl = imagePreview || imageUrl;

    return (
        <Paper p="md" withBorder radius="md">
            <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                    <Text size="sm" fw={500}>
                        Image {index + 1}
                    </Text>
                    <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => onRemove(index)}
                        disabled={isUploading}
                        leftSection={<IconX size={14} />}
                    >
                        Remove
                    </Button>
                </Group>

                {/* Image and Note side by side */}
                <Group align="flex-start" gap="md" wrap="nowrap">
                    {/* Thumbnail Image Preview */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f5f5f5",
                            borderRadius: 8,
                            overflow: "hidden",
                            position: "relative",
                            cursor: displayUrl ? "pointer" : "default",
                        }}
                        onClick={() => displayUrl && setPreviewOpen(true)}
                    >
                        {isUploading ? (
                            <Loader size="sm" />
                        ) : displayUrl ? (
                            <>
                                <Image
                                    src={displayUrl}
                                    alt={`Preview ${index + 1}`}
                                    fit="cover"
                                    style={{ width: "100%", height: "100%" }}
                                />
                                <ActionIcon
                                    variant="filled"
                                    color="dark"
                                    size="xs"
                                    radius="xl"
                                    style={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        opacity: 0.8,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewOpen(true);
                                    }}
                                >
                                    <IconMaximize size={12} />
                                </ActionIcon>
                            </>
                        ) : (
                            <Stack align="center" gap={4}>
                                <IconPhoto size={32} color="#999" />
                                <Text size="xs" c="dimmed">
                                    No preview
                                </Text>
                            </Stack>
                        )}
                    </div>

                    {/* Image Note Input - takes remaining space */}
                    <TextInput
                        label="Image Note (optional)"
                        placeholder="Add a note for this image..."
                        value={note || ""}
                        onChange={(e) => onNoteChange(index, e.currentTarget.value)}
                        disabled={isUploading}
                        style={{ flex: 1 }}
                    />
                </Group>
            </Stack>

            {/* Full Size Preview Modal */}
            {previewOpen && displayUrl && (
                <Modal
                    opened={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    centered
                    size="xl"
                    withCloseButton={false}
                    padding={0}
                >
                    <div style={{ position: "relative" }}>
                        <ActionIcon
                            variant="filled"
                            color="dark"
                            size="lg"
                            radius="xl"
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                zIndex: 10,
                            }}
                            onClick={() => setPreviewOpen(false)}
                        >
                            <IconX size={18} />
                        </ActionIcon>

                        <Stack gap="md" p="md">
                            <div
                                style={{
                                    width: "100%",
                                    maxHeight: "70vh",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    src={displayUrl}
                                    alt={`Image ${index + 1}`}
                                    fit="contain"
                                    style={{ maxWidth: "100%", maxHeight: "70vh" }}
                                />
                            </div>
                            {note && (
                                <Text size="sm" ta="center" c="dimmed">
                                    {note}
                                </Text>
                            )}
                            <Text size="xs" ta="center" c="dimmed">
                                Image {index + 1}
                            </Text>
                        </Stack>
                    </div>
                </Modal>
            )}
        </Paper>
    );
}

