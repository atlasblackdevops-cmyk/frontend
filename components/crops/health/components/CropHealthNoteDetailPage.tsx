"use client";

import { useState, useEffect } from "react";
import {
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
    Title,
    Breadcrumbs,
    Anchor,
    Skeleton,
    Alert,
} from "@mantine/core";
import { IconEdit, IconTrash, IconArrowLeft, IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/components/ui/useToast";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useCropHealthNotes } from "../hooks";
import type { CropHealthNoteRecord } from "../types";
import {
    HEALTH_STATUS_COLORS,
    HEALTH_STATUS_ICONS,
} from "../types";

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

interface CropHealthNoteDetailPageProps {
    noteId: string;
}

export default function CropHealthNoteDetailPage({ noteId }: CropHealthNoteDetailPageProps) {
    const router = useRouter();
    const { permissions, role } = useAuth();
    const { Toast, showToast } = useToast();
    const { fetchNoteDetails, deleteNote } = useCropHealthNotes();

    const [note, setNote] = useState<CropHealthNoteRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permission checks
    const canUpdate = hasPermission("CROPS", "UPDATE", permissions, role);
    const canDelete = hasPermission("CROPS", "DELETE", permissions, role);

    // Load note details
    useEffect(() => {
        if (noteId) {
            setIsLoading(true);
            fetchNoteDetails(noteId).then((noteData) => {
                if (noteData) {
                    setNote(noteData);
                } else {
                    showToast("Failed to load crop health note", "red");
                    router.push("/crops/health-notes");
                }
                setIsLoading(false);
            });
        }
    }, [noteId]);

    const handleDelete = async () => {
        if (!note) return;

        setIsDeleting(true);
        try {
            const success = await deleteNote(note.id);
            if (success) {
                showToast("Crop health note deleted successfully", "green");
                router.push("/crops/health-notes");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete crop health note";
            showToast(message, "red");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handleCloseLightbox = () => {
        setSelectedImageIndex(null);
    };

    const handlePreviousImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0 && note) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && note && selectedImageIndex < (note.images?.length || 0) - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    if (isLoading) {
        return (
            <Paper p="xl" radius="md" withBorder>
                <Stack gap="md">
                    <Skeleton height={40} />
                    <Skeleton height={200} />
                    <Skeleton height={100} />
                </Stack>
            </Paper>
        );
    }

    if (!note) {
        return (
            <Paper p="xl" radius="md" withBorder>
                <Alert color="red" title="Error">
                    Crop health note not found.
                </Alert>
            </Paper>
        );
    }

    const statusColor = HEALTH_STATUS_COLORS[note.healthStatus || ""] || "gray";
    const statusIcon = HEALTH_STATUS_ICONS[note.healthStatus || ""] || "";
    const images = note.images || [];

    return (
        <>
            <Paper p="xl" radius="md" withBorder>
                <Stack gap="lg">
                    <Toast />
                    
                    {/* Breadcrumbs */}
                    <Breadcrumbs>
                        <Anchor onClick={() => router.push("/crops/health-notes")}>
                            Crop Health Notes
                        </Anchor>
                        <Text>Note Details</Text>
                    </Breadcrumbs>

                    {/* Header */}
                    <Group justify="space-between" align="flex-start">
                        <Stack gap="xs">
                            <Title order={2}>Crop Health Note Details</Title>
                            <Group gap="xs">
                                <Text fw={600}>Field: {note.fieldName || note.fieldId}</Text>
                                {note.healthStatus && (
                                    <Badge color={statusColor} leftSection={statusIcon}>
                                        {note.healthStatus}
                                    </Badge>
                                )}
                            </Group>
                            <Text size="sm" c="dimmed">
                                Date: {formatDate(new Date(note.noteDate), "MMMM d, yyyy")}
                            </Text>
                        </Stack>
                        <Group>
                            <Button
                                variant="subtle"
                                leftSection={<IconArrowLeft size={16} />}
                                onClick={() => router.push("/crops/health-notes")}
                            >
                                Back
                            </Button>
                            {canUpdate && (
                                <Button
                                    variant="light"
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => router.push(`/crops/health-notes/${note.id}/edit`)}
                                >
                                    Edit
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="light"
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => setDeleteModalOpen(true)}
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
                            <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
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
                            <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
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
                            Created: {formatDate(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                        <Text size="xs" c="dimmed">
                            Noted by: {note.createdBy?.name || "Unknown"}
                        </Text>
                        {note.updatedAt !== note.createdAt && (
                            <Text size="xs" c="dimmed">
                                Last updated: {formatDate(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                            </Text>
                        )}
                    </Stack>
                </Stack>
            </Paper>

            {/* Image Lightbox Modal */}
            {selectedImageIndex !== null && images[selectedImageIndex] && (
                <Paper
                    p={0}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={handleCloseLightbox}
                >
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCloseLightbox();
                            }}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviousImage();
                                }}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextImage();
                                }}
                            >
                                <IconChevronRight size={24} />
                            </ActionIcon>
                        )}

                        <Stack gap="md" p="md" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
                            <div
                                style={{
                                    width: "100%",
                                    maxHeight: "80vh",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={images[selectedImageIndex].url}
                                    alt={`Image ${selectedImageIndex + 1}`}
                                    fit="contain"
                                    style={{ maxWidth: "100%", maxHeight: "80vh" }}
                                />
                            </div>
                            {images[selectedImageIndex].note && (
                                <Text size="sm" ta="center" c="white">
                                    {images[selectedImageIndex].note}
                                </Text>
                            )}
                            <Text size="xs" ta="center" c="dimmed">
                                Image {selectedImageIndex + 1} of {images.length}
                            </Text>
                        </Stack>
                    </div>
                </Paper>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Crop Health Note"
                message={`Are you sure you want to delete this crop health note? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={note.fieldName || ""}
                itemType="crop health note"
            />
        </>
    );
}

