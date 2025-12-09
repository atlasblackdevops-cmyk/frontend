"use client";

import { useState } from "react";
import {
    Paper,
    Stack,
    Group,
    Text,
    Badge,
    Button,
    Image,
    Skeleton,
    Grid,
    Divider,
} from "@mantine/core";
import { IconEdit, IconTrash, IconEye, IconPhoto } from "@tabler/icons-react";
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
import type { CropHealthNoteTimelineProps, CropHealthNoteRecord } from "../types";
import {
    HEALTH_STATUS_COLORS,
    HEALTH_STATUS_ICONS,
} from "../types";

export function CropHealthNoteTimeline({
    notes,
    isLoading,
    canUpdate,
    canDelete,
    onView,
    onUpdate,
    onDelete,
}: CropHealthNoteTimelineProps) {
    if (isLoading) {
        return (
            <Stack gap="md">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={200} radius="md" />
                ))}
            </Stack>
        );
    }

    if (notes.length === 0) {
        return (
            <Paper p="xl" withBorder radius="md">
                <Text c="dimmed" ta="center">
                    No crop health notes found. Create your first note to get started.
                </Text>
            </Paper>
        );
    }

    // Group notes by date
    const groupedNotes = notes.reduce((acc, note) => {
        const date = formatDate(new Date(note.noteDate), "MMMM d, yyyy");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(note);
        return acc;
    }, {} as Record<string, typeof notes>);

    return (
        <Stack gap="lg">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
                <Stack key={date} gap="md">
                    <Text fw={600} size="lg" c="dimmed">
                        📅 {date}
                    </Text>
                    {dateNotes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onView={() => onView(note)}
                            onUpdate={() => onUpdate(note)}
                            onDelete={() => onDelete(note)}
                        />
                    ))}
                </Stack>
            ))}
        </Stack>
    );
}

function NoteCard({
    note,
    canUpdate,
    canDelete,
    onView,
    onUpdate,
    onDelete,
}: {
    note: typeof notes[0];
    canUpdate: boolean;
    canDelete: boolean;
    onView: () => void;
    onUpdate: () => void;
    onDelete: () => void;
}) {
    const statusColor =
        HEALTH_STATUS_COLORS[note.healthStatus || ""] || "gray";
    const statusIcon =
        HEALTH_STATUS_ICONS[note.healthStatus || ""] || "";

    const images = note.images || [];
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - displayImages.length;

    const descriptionPreview = note.description
        ? note.description.length > 150
            ? `${note.description.substring(0, 150)}...`
            : note.description
        : null;

    return (
        <Paper p="md" withBorder radius="md">
            <Stack gap="md">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                    <Stack gap="xs">
                        <Group gap="xs">
                            <Text fw={600}>Field: {note.fieldName || note.fieldId}</Text>
                            {note.healthStatus && (
                                <Badge
                                    color={statusColor}
                                    leftSection={statusIcon}
                                >
                                    {note.healthStatus}
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                    <Group gap="xs">
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconEye size={14} />}
                            onClick={onView}
                        >
                            View Details
                        </Button>
                        {canUpdate && (
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconEdit size={14} />}
                                onClick={onUpdate}
                            >
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="subtle"
                                color="red"
                                size="xs"
                                leftSection={<IconTrash size={14} />}
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        )}
                    </Group>
                </Group>

                {/* Images */}
                {images.length > 0 ? (
                    <div>
                        <Group gap="xs">
                            {displayImages.map((img, idx) => (
                                <div
                                    key={img.key || idx}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        border: "1px solid #e0e0e0",
                                    }}
                                    onClick={onView}
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Image ${idx + 1}`}
                                        fit="cover"
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                            ))}
                            {remainingCount > 0 && (
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        border: "1px solid #e0e0e0",
                                        cursor: "pointer",
                                    }}
                                    onClick={onView}
                                >
                                    <Stack align="center" gap={4}>
                                        <IconPhoto size={24} color="#999" />
                                        <Text size="xs" c="dimmed">
                                            +{remainingCount}
                                        </Text>
                                    </Stack>
                                </div>
                            )}
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">
                            Click to view gallery
                        </Text>
                    </div>
                ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                        (No images)
                    </Text>
                )}

                <Divider />

                {/* Description */}
                {descriptionPreview && (
                    <div>
                        <Text fw={500} size="sm" mb="xs">
                            Description:
                        </Text>
                        <Text size="sm" c="dimmed">
                            {descriptionPreview}
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

                {/* Footer */}
                <Group justify="space-between" c="dimmed">
                    <Text size="xs">
                        Noted by: {note.createdBy?.name || "Unknown"}
                    </Text>
                    <Text size="xs">
                        {formatDate(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}

