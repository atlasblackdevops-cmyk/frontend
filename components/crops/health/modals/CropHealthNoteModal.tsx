"use client";

import {
    Modal,
    Button,
    Group,
    ScrollArea,
    Stack,
    Select,
    Textarea,
    Text,
    Divider,
    FileButton,
    Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useEffect, useState, useRef } from "react";
import { IconAlertCircle, IconPhoto, IconInfoCircle } from "@tabler/icons-react";
import type {
    AddCropHealthNoteValues,
    CropHealthNoteModalProps,
    CropHealthNoteRecord,
    CropHealthImage,
} from "../types";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import { HEALTH_STATUS_OPTIONS } from "../types";
import { ImagePreviewCard } from "../components/ImagePreviewCard";
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
const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

const mapNoteToValues = (note: CropHealthNoteRecord): AddCropHealthNoteValues => {
    // For update mode, we don't include existing images in the form
    // They are handled separately via deletedImageKeys
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

export function CropHealthNoteModal({
    mode,
    note,
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: CropHealthNoteModalProps) {
    const { options: fieldOptions, loading: loadingFields } =
        useActiveFieldsOptions(opened);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageNotes, setImageNotes] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<CropHealthImage[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [imageErrors, setImageErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLButtonElement>(null);

    const form = useForm<Omit<AddCropHealthNoteValues, "images" | "imageNotes">>({
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

    useEffect(() => {
        if (!opened) {
            // Reset form when modal closes
            form.setValues({
                fieldId: "",
                noteDate: "",
                healthStatus: "",
                description: "",
                actionTaken: "",
            });
            setImageFiles([]);
            setImageNotes([]);
            setExistingImages([]);
            setImagesToDelete([]);
            setImageErrors([]);
            return;
        }

        if (mode === "update" && note) {
            const mapped = mapNoteToValues(note);
            form.setValues({
                fieldId: mapped.fieldId,
                noteDate: mapped.noteDate,
                healthStatus: mapped.healthStatus,
                description: mapped.description,
                actionTaken: mapped.actionTaken,
            });
            setExistingImages(note.images || []);
            setImageFiles([]);
            setImageNotes([]);
            setImagesToDelete([]);
        } else {
            // Set default date to today for create mode
            const today = new Date();
            form.setFieldValue("noteDate", today.toISOString().split("T")[0]);
        }
    }, [mode, note, opened]);

    const handleImageSelect = (files: File[] | null) => {
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        const newErrors: string[] = [];
        const newNotes: string[] = [];

        const totalImages = imageFiles.length + existingImages.length - imagesToDelete.length;

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
    };

    const handleImageNoteChange = (index: number, note: string) => {
        const newNotes = [...imageNotes];
        newNotes[index] = note;
        setImageNotes(newNotes);
    };

    const handleSubmit = async (values: typeof form.values) => {
        const submitValues: AddCropHealthNoteValues = {
            ...values,
            images: imageFiles,
            imageNotes: imageNotes,
        };

        await onSubmit(submitValues);
        
        if (mode === "create") {
            form.reset();
            setImageFiles([]);
            setImageNotes([]);
        }
    };

    const requiredFilled = !!form.values.fieldId && !!form.values.noteDate;
    const submitDisabled = isSubmitting || !requiredFilled;

    const totalImages = imageFiles.length + existingImages.length - imagesToDelete.length;
    const canAddMore = totalImages < MAX_IMAGES;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            size="lg"
        >
            <ScrollArea.Autosize mah={600}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        {/* Field Selection */}
                        <Select
                            label="Field"
                            placeholder={
                                loadingFields ? "Loading fields..." : "Select field"
                            }
                            data={fieldOptions}
                            disabled={loadingFields}
                            searchable
                            required
                            {...form.getInputProps("fieldId")}
                        />

                        {/* Note Date */}
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
                                const d = value ? new Date(value as string) : null;
                                form.setFieldValue(
                                    "noteDate",
                                    d ? d.toISOString().split("T")[0] : ""
                                );
                            }}
                            required
                            clearable={false}
                            {...form.getInputProps("noteDate")}
                        />

                        {/* Health Status */}
                        <Select
                            label="Health Status"
                            placeholder="Select status (optional)"
                            data={HEALTH_STATUS_OPTIONS.filter((opt) => opt.value !== "")}
                            clearable
                            {...form.getInputProps("healthStatus")}
                        />

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

                        <Divider label="Images (Optional)" labelPosition="center" />

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
                                .filter((img) => !imagesToDelete.includes(img.key))
                                .map((img, idx) => (
                                    <ImagePreviewCard
                                        key={img.key}
                                        image={img}
                                        index={idx}
                                        note={img.note || ""}
                                        onNoteChange={() => {}} // Notes for existing images can't be edited
                                        onRemove={() => handleRemoveExistingImage(img.key)}
                                        isUploading={isSubmitting}
                                    />
                                ))}

                        {/* New Image Previews */}
                        {imageFiles.map((file, idx) => (
                            <ImagePreviewCard
                                key={`new-${idx}`}
                                image={file}
                                index={existingImages.length - imagesToDelete.length + idx}
                                note={imageNotes[idx] || ""}
                                onNoteChange={handleImageNoteChange}
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
                                You can save without images. Supported formats: JPG, PNG, GIF, WEBP
                            </Text>
                        </Group>
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={onClose}
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
                </form>
            </ScrollArea.Autosize>
        </Modal>
    );
}

