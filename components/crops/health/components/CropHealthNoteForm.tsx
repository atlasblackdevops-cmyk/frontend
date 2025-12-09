"use client";

import {
    Button,
    Group,
    Stack,
    Select,
    Textarea,
    Text,
    Divider,
    FileButton,
    Alert,
    Paper,
    Title,
    Breadcrumbs,
    Anchor,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    IconAlertCircle,
    IconPhoto,
    IconInfoCircle,
    IconArrowLeft,
} from "@tabler/icons-react";
import type {
    AddCropHealthNoteValues,
    CropHealthNoteRecord,
    CropHealthImage,
} from "../types";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import { HEALTH_STATUS_OPTIONS } from "../types";
import { ImagePreviewCard } from "./ImagePreviewCard";
import { useCropHealthNotes } from "../hooks";
import { useAuth } from "@/stores/use-auth-store";
import { useToast } from "@/components/ui/useToast";
import "@mantine/dates/styles.css";

const BASE_VALUES: AddCropHealthNoteValues = {
    fieldId: "",
    noteDate: "",
    healthStatus: "",
    description: "",
    actionTaken: "",
    images: [],
    imageNotes: [],
};

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
];

const mapNoteToValues = (
    note: CropHealthNoteRecord
): AddCropHealthNoteValues => {
    return {
        fieldId: note.fieldId,
        noteDate: note.noteDate,
        healthStatus: note.healthStatus || "",
        description: note.description || "",
        actionTaken: note.actionTaken || "",
        images: [],
        imageNotes: [],
    };
};

interface CropHealthNoteFormProps {
    mode: "create" | "update";
    noteId?: string;
}

export default function CropHealthNoteForm({
    mode,
    noteId,
}: CropHealthNoteFormProps) {
    const router = useRouter();
    const { farmId } = useAuth();
    const { Toast, showToast } = useToast();
    const { options: fieldOptions, loading: loadingFields } =
        useActiveFieldsOptions(true);
    const { fetchNoteDetails, createNote, updateNote } = useCropHealthNotes();

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageNotes, setImageNotes] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<CropHealthImage[]>([]);
    const [existingImageNotes, setExistingImageNotes] = useState<
        Record<string, string>
    >({}); // Track edited notes for existing images
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [imageErrors, setImageErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLButtonElement>(null);

    const form = useForm<
        Omit<AddCropHealthNoteValues, "images" | "imageNotes">
    >({
        initialValues: {
            fieldId: "",
            noteDate: "",
            healthStatus: "",
            description: "",
            actionTaken: "",
        },
        validateInputOnBlur: true,
        validate: {
            fieldId: (value) => (!value ? "Field is required" : null),
            noteDate: (value) => (!value ? "Note date is required" : null),
        },
    });

    const title =
        mode === "create" ? "Crop Health Note" : "Edit Crop Health Note";
    const submitLabel = mode === "create" ? "Save Note" : "Update Note";

    // Load note data for edit mode
    useEffect(() => {
        if (mode === "update" && noteId) {
            setIsLoading(true);
            fetchNoteDetails(noteId).then((note) => {
                if (note) {
                    const mapped = mapNoteToValues(note);
                    form.setValues({
                        fieldId: mapped.fieldId,
                        noteDate: mapped.noteDate,
                        healthStatus: mapped.healthStatus,
                        description: mapped.description,
                        actionTaken: mapped.actionTaken,
                    });
                    const images = note.images || [];
                    setExistingImages(images);
                    // Initialize existing image notes
                    const notesMap: Record<string, string> = {};
                    images.forEach((img) => {
                        notesMap[img.key] = img.note || "";
                    });
                    setExistingImageNotes(notesMap);
                }
                setIsLoading(false);
            });
        } else if (mode === "create") {
            // Set default date to today for create mode
            const today = new Date();
            form.setFieldValue("noteDate", today.toISOString().split("T")[0]);
        }
    }, [mode, noteId]);

    const handleImageSelect = (files: File[] | null) => {
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        const newErrors: string[] = [];
        const newNotes: string[] = [];

        const totalImages =
            imageFiles.length + existingImages.length - imagesToDelete.length;

        files.forEach((file, idx) => {
            // Check total count
            if (totalImages + newFiles.length >= MAX_IMAGES) {
                newErrors.push(`Maximum ${MAX_IMAGES} images allowed`);
                return;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                newErrors.push(`${file.name}: File size exceeds 10MB`);
                return;
            }

            // Check file format
            if (!ALLOWED_FORMATS.includes(file.type)) {
                newErrors.push(
                    `${file.name}: Invalid format. Allowed: JPG, PNG, GIF, WEBP`
                );
                return;
            }

            newFiles.push(file);
            newNotes.push("");
        });

        if (newErrors.length > 0) {
            setImageErrors((prev) => [...prev, ...newErrors]);
            setTimeout(() => setImageErrors([]), 5000);
        }

        if (newFiles.length > 0) {
            setImageFiles((prev) => [...prev, ...newFiles]);
            setImageNotes((prev) => [...prev, ...newNotes]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImageNotes((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (key: string) => {
        setExistingImages((prev) => prev.filter((img) => img.key !== key));
        setImagesToDelete((prev) => [...prev, key]);
        // Remove note from map
        setExistingImageNotes((prev) => {
            const newMap = { ...prev };
            delete newMap[key];
            return newMap;
        });
    };

    const handleImageNoteChange = (index: number, note: string) => {
        const newNotes = [...imageNotes];
        newNotes[index] = note;
        setImageNotes(newNotes);
    };

    const handleExistingImageNoteChange = (key: string, note: string) => {
        setExistingImageNotes((prev) => ({
            ...prev,
            [key]: note,
        }));
    };

    const handleSubmit = async (values: typeof form.values) => {
        if (!farmId) return;

        setIsSubmitting(true);

        try {
            if (mode === "create") {
                const success = await createNote({
                    fieldId: values.fieldId,
                    noteDate: values.noteDate,
                    healthStatus: values.healthStatus || undefined,
                    description: values.description || undefined,
                    actionTaken: values.actionTaken || undefined,
                    images: imageFiles,
                    imageNotes: imageNotes,
                });

                if (success) {
                    showToast("Crop health note created successfully", "green");
                    router.push("/crops/health-notes");
                }
            } else if (mode === "update" && noteId) {
                // Prepare existing image notes that were edited
                // Only include images that have notes different from original
                const editedExistingImageNotes: Record<string, string> = {};
                existingImages
                    .filter((img) => !imagesToDelete.includes(img.key))
                    .forEach((img) => {
                        const currentNote =
                            existingImageNotes[img.key] ?? img.note ?? "";
                        const originalNote = img.note ?? "";
                        // Only include if note was actually changed
                        if (currentNote !== originalNote) {
                            editedExistingImageNotes[img.key] = currentNote;
                        }
                    });

                const success = await updateNote(noteId, {
                    fieldId: values.fieldId,
                    noteDate: values.noteDate,
                    healthStatus: values.healthStatus || undefined,
                    description: values.description || undefined,
                    actionTaken: values.actionTaken || undefined,
                    images: imageFiles.length > 0 ? imageFiles : undefined,
                    imageNotes: imageFiles.length > 0 ? imageNotes : undefined,
                    existingImageNotes:
                        Object.keys(editedExistingImageNotes).length > 0
                            ? editedExistingImageNotes
                            : undefined,
                    deletedImageKeys:
                        imagesToDelete.length > 0 ? imagesToDelete : undefined,
                });

                if (success) {
                    showToast("Crop health note updated successfully", "green");
                    router.push("/crops/health-notes");
                }
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to save crop health note";
            showToast(message, "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const requiredFilled = !!form.values.fieldId && !!form.values.noteDate;
    const submitDisabled = isSubmitting || !requiredFilled || isLoading;

    const totalImages =
        imageFiles.length + existingImages.length - imagesToDelete.length;
    const canAddMore = totalImages < MAX_IMAGES;

    if (isLoading) {
        return (
            <Paper p="xl">
                <Text>Loading...</Text>
            </Paper>
        );
    }

    return (
        <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
                <Toast />

                {/* Breadcrumbs */}
                <Breadcrumbs>
                    <Anchor onClick={() => router.push("/crops/health-notes")}>
                        Crop Health Notes
                    </Anchor>
                    <Text>{title}</Text>
                </Breadcrumbs>

                {/* Header */}
                <Group justify="space-between">
                    <Title order={2}>{title}</Title>
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => router.push("/crops/health-notes")}
                    >
                        Back
                    </Button>
                </Group>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        {/* Field Selection */}
                        <Select
                            label="Field"
                            placeholder={
                                loadingFields
                                    ? "Loading fields..."
                                    : "Select field"
                            }
                            data={fieldOptions}
                            disabled={loadingFields}
                            searchable
                            required
                            {...form.getInputProps("fieldId")}
                        />

                        {/* Note Date and Health Status */}
                        <Group grow>
                            <DateInput
                                label="Note Date"
                                placeholder="Select date"
                                valueFormat="YYYY-MM-DD"
                                value={
                                    form.values.noteDate
                                        ? new Date(form.values.noteDate)
                                        : null
                                }
                                onChange={(value) => {
                                    const d = value
                                        ? new Date(value as string)
                                        : null;
                                    form.setFieldValue(
                                        "noteDate",
                                        d ? d.toISOString().split("T")[0] : ""
                                    );
                                }}
                                required
                                clearable={false}
                                error={form.errors.noteDate}
                            />
                            <Select
                                label="Health Status"
                                placeholder="Select status (optional)"
                                data={HEALTH_STATUS_OPTIONS.filter(
                                    (opt) => opt.value !== ""
                                )}
                                clearable
                                {...form.getInputProps("healthStatus")}
                            />
                        </Group>

                        {/* Description */}
                        <Textarea
                            label="Description"
                            placeholder="Describe the crop health observation..."
                            minRows={3}
                            {...form.getInputProps("description")}
                        />

                        {/* Action Taken */}
                        <Textarea
                            label="Action Taken"
                            placeholder="Describe any actions taken..."
                            minRows={3}
                            {...form.getInputProps("actionTaken")}
                        />

                        <Divider
                            label="Images (Optional)"
                            labelPosition="center"
                        />

                        {/* Image Errors */}
                        {imageErrors.length > 0 && (
                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                title="Image Upload Errors"
                                color="red"
                                onClose={() => setImageErrors([])}
                                withCloseButton
                            >
                                {imageErrors.map((error, idx) => (
                                    <Text key={idx} size="sm">
                                        {error}
                                    </Text>
                                ))}
                            </Alert>
                        )}

                        {/* Existing Images (Update Mode) */}
                        {mode === "update" &&
                            existingImages
                                .filter(
                                    (img) => !imagesToDelete.includes(img.key)
                                )
                                .map((img, idx) => (
                                    <ImagePreviewCard
                                        key={img.key}
                                        image={img}
                                        index={idx}
                                        note={
                                            existingImageNotes[img.key] !==
                                            undefined
                                                ? existingImageNotes[img.key]
                                                : img.note || ""
                                        }
                                        onNoteChange={(index, note) => {
                                            // index is not used for existing images, we use the key
                                            handleExistingImageNoteChange(
                                                img.key,
                                                note
                                            );
                                        }}
                                        onRemove={() =>
                                            handleRemoveExistingImage(img.key)
                                        }
                                        isUploading={isSubmitting}
                                    />
                                ))}

                        {/* New Image Previews */}
                        {imageFiles.map((file, idx) => (
                            <ImagePreviewCard
                                key={`new-${idx}`}
                                image={file}
                                index={idx}
                                note={imageNotes[idx] || ""}
                                onNoteChange={(index, note) => {
                                    // For new images, use the index directly
                                    handleImageNoteChange(index, note);
                                }}
                                onRemove={handleRemoveImage}
                                isUploading={isSubmitting}
                            />
                        ))}

                        {/* Add Image Button */}
                        <FileButton
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            multiple
                            disabled={!canAddMore || isSubmitting}
                        >
                            {(props) => (
                                <Button
                                    {...props}
                                    leftSection={<IconPhoto size={16} />}
                                    variant="light"
                                    disabled={!canAddMore || isSubmitting}
                                >
                                    {canAddMore
                                        ? `Add Image${totalImages > 0 ? "s" : ""} (Max ${MAX_IMAGES}, 10MB each)`
                                        : `Maximum ${MAX_IMAGES} images reached`}
                                </Button>
                            )}
                        </FileButton>

                        {/* Info Text */}
                        <Group gap="xs" c="dimmed">
                            <IconInfoCircle size={16} />
                            <Text size="xs">
                                You can save without images. Supported formats:
                                JPG, PNG, GIF, WEBP
                            </Text>
                        </Group>

                        {/* Action Buttons */}
                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="subtle"
                                onClick={() =>
                                    router.push("/crops/health-notes")
                                }
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                disabled={submitDisabled}
                            >
                                {submitLabel}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Stack>
        </Paper>
    );
}
