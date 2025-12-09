"use client";

import {
    Modal,
    Button,
    Group,
    Stack,
    Text,
    Badge,
    Grid,
    Image,
    Divider,
    Paper,
    ActionIcon,
} from "@mantine/core";
import { IconEdit, IconTrash, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
// Format date helper
const formatDate = (date: Date | string, formatStr: string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (formatStr === "MMMM d, yyyy") {
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    if (formatStr === "MMM d, yyyy 'at' h:mm a") {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    }
    return d.toLocaleDateString();
};
import { useState } from "react";
import type { CropHealthNoteDetailModalProps } from "../types";
import {
    HEALTH_STATUS_COLORS,
    HEALTH_STATUS_ICONS,
} from "../types";

export function CropHealthNoteDetailModal({
    opened,
    onClose,
    note,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}: CropHealthNoteDetailModalProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    if (!note) return null;

    const statusColor = HEALTH_STATUS_COLORS[note.healthStatus || ""] || "gray";
    const statusIcon = HEALTH_STATUS_ICONS[note.healthStatus || ""] || "";
    const images = note.images || [];

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handleCloseLightbox = () => {
        setSelectedImageIndex(null);
    };

    const handlePreviousImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title="Crop Health Note Details"
                centered
                size="lg"
            >
                <Stack gap="md">
                    {/* Header Info */}
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text fw={600}>Field: {note.fieldName || note.fieldId}</Text>
                            <Text size="sm" c="dimmed">
                                Date: {formatDate(new Date(note.noteDate), "MMMM d, yyyy")}
                            </Text>
                            {note.healthStatus && (
                                <Badge color={statusColor} leftSection={statusIcon}>
                                    {note.healthStatus}
                                </Badge>
                            )}
                        </Stack>
                        <Group>
                            {canUpdate && (
                                <Button
                                    variant="light"
                                    leftSection={<IconEdit size={16} />}
                                    onClick={onEdit}
                                >
                                    Edit
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="light"
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={onDelete}
                                >
                                    Delete
                                </Button>
                            )}
                        </Group>
                    </Group>

                    <Divider />

                    {/* Description */}
                    {note.description && (
                        <div>
                            <Text fw={500} size="sm" mb="xs">
                                Description:
                            </Text>
                            <Text size="sm" c="dimmed">
                                {note.description}
                            </Text>
                        </div>
                    )}

                    {/* Action Taken */}
                    {note.actionTaken && (
                        <div>
                            <Text fw={500} size="sm" mb="xs">
                                Action Taken:
                            </Text>
                            <Text size="sm" c="dimmed">
                                {note.actionTaken}
                            </Text>
                        </div>
                    )}

                    {/* Images */}
                    {images.length > 0 && (
                        <div>
                            <Text fw={500} size="sm" mb="md">
                                Images ({images.length})
                            </Text>
                            <Grid>
                                {images.map((img, idx) => (
                                    <Grid.Col key={img.key || idx} span={{ base: 12, sm: 6, md: 4 }}>
                                        <Paper
                                            p="xs"
                                            withBorder
                                            radius="md"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleImageClick(idx)}
                                        >
                                            <Stack gap="xs">
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        aspectRatio: "1",
                                                        borderRadius: 8,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={`Image ${idx + 1}`}
                                                        fit="cover"
                                                        style={{ width: "100%", height: "100%" }}
                                                    />
                                                </div>
                                                {img.note && (
                                                    <Text size="xs" c="dimmed">
                                                        {img.note}
                                                    </Text>
                                                )}
                                                {!img.note && (
                                                    <Text size="xs" c="dimmed" fs="italic">
                                                        No note
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid.Col>
                                ))}
                            </Grid>
                            <Text size="xs" c="dimmed" mt="xs">
                                Click image to view full size
                            </Text>
                        </div>
                    )}

                    <Divider />

                    {/* Footer Info */}
                    <Stack gap="xs">
                        <Text size="xs" c="dimmed">
                            Created: {formatDate(new Date(note.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </Text>
                        <Text size="xs" c="dimmed">
                            Noted by: {note.createdBy?.name || "Unknown"}
                        </Text>
                        {note.updatedAt !== note.createdAt && (
                            <Text size="xs" c="dimmed">
                                Last updated: {formatDate(new Date(note.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                            </Text>
                        )}
                    </Stack>
                </Stack>
            </Modal>

            {/* Image Lightbox */}
            {selectedImageIndex !== null && images[selectedImageIndex] && (
                <Modal
                    opened={selectedImageIndex !== null}
                    onClose={handleCloseLightbox}
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
                            onClick={handleCloseLightbox}
                        >
                            <IconX size={18} />
                        </ActionIcon>

                        {selectedImageIndex > 0 && (
                            <ActionIcon
                                variant="filled"
                                color="dark"
                                size="xl"
                                radius="xl"
                                style={{
                                    position: "absolute",
                                    left: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 10,
                                }}
                                onClick={handlePreviousImage}
                            >
                                <IconChevronLeft size={24} />
                            </ActionIcon>
                        )}

                        {selectedImageIndex < images.length - 1 && (
                            <ActionIcon
                                variant="filled"
                                color="dark"
                                size="xl"
                                radius="xl"
                                style={{
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 10,
                                }}
                                onClick={handleNextImage}
                            >
                                <IconChevronRight size={24} />
                            </ActionIcon>
                        )}

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
                                    src={images[selectedImageIndex].url}
                                    alt={`Image ${selectedImageIndex + 1}`}
                                    fit="contain"
                                    style={{ maxWidth: "100%", maxHeight: "70vh" }}
                                />
                            </div>
                            {images[selectedImageIndex].note && (
                                <Text size="sm" ta="center" c="dimmed">
                                    {images[selectedImageIndex].note}
                                </Text>
                            )}
                            <Text size="xs" ta="center" c="dimmed">
                                Image {selectedImageIndex + 1} of {images.length}
                            </Text>
                        </Stack>
                    </div>
                </Modal>
            )}
        </>
    );
}

