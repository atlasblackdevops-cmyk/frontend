import { api } from "@/lib/api";
import type {
    CropHealthNotesApiResponse,
    CropHealthNoteDetailsResponse,
    CropHealthNoteRecord,
    PaginationInfo,
    GetCropHealthNotesParams,
    CreateCropHealthNoteData,
    UpdateCropHealthNoteData,
} from "@/components/crops/health/types";

/**
 * Get list of crop health notes with filters and pagination
 */
export async function getCropHealthNotes(
    params: GetCropHealthNotesParams = {}
): Promise<{ notes: CropHealthNoteRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.fieldId && params.fieldId !== "all") {
        queryParams.append("fieldId", params.fieldId);
    }
    if (params.dateFrom) {
        queryParams.append("noteDateFrom", params.dateFrom);
    }
    if (params.dateTo) {
        queryParams.append("noteDateTo", params.dateTo);
    }

    const response = await api.get<CropHealthNotesApiResponse>(
        `/api/v1/crop-health-notes?${queryParams.toString()}`
    );

    const responseData = response.data?.data;
    const notes = responseData?.notes ?? [];
    const pagination = responseData?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    };

    return {
        notes: Array.isArray(notes)
            ? notes.map((note: any) => ({
                  id: note.id,
                  fieldId: note.field?.id || note.fieldId,
                  fieldName: note.field?.fieldName || note.fieldName,
                  noteDate: note.noteDate,
                  healthStatus: note.healthStatus,
                  description: note.description,
                  actionTaken: note.actionTaken,
                  images: (note.images || []).map((img: any) => ({
                      key: img.id || img.key,
                      url: img.imageUrl || img.url,
                      note: img.notes || img.note,
                      createdAt: img.createdAt,
                  })),
                  createdBy: note.notedBy || note.createdBy,
                  updatedBy: note.updatedBy,
                  createdAt: note.createdAt,
                  updatedAt: note.updatedAt,
              }))
            : [],
        pagination,
    };
}

/**
 * Get single crop health note details by ID
 */
export async function getCropHealthNoteDetails(
    noteId: string
): Promise<CropHealthNoteRecord> {
    const response = await api.get<CropHealthNoteDetailsResponse>(
        `/api/v1/crop-health-notes/${noteId}`
    );

    const responseData = response.data?.data ?? response.data;
    const noteData = responseData?.note;

    if (!noteData) {
        throw new Error("Crop health note not found");
    }

    return {
        id: noteData.id,
        fieldId: noteData.field?.id || noteData.fieldId,
        fieldName: noteData.field?.fieldName || noteData.fieldName,
        noteDate: noteData.noteDate,
        healthStatus: noteData.healthStatus,
        description: noteData.description,
        actionTaken: noteData.actionTaken,
        images: (noteData.images || []).map((img: any) => ({
            key: img.id || img.key,
            url: img.imageUrl || img.url,
            note: img.notes || img.note,
            createdAt: img.createdAt,
        })),
        createdBy: noteData.notedBy || noteData.createdBy,
        updatedBy: noteData.updatedBy,
        createdAt: noteData.createdAt,
        updatedAt: noteData.updatedAt,
    };
}

/**
 * Create a new crop health note with optional images
 */
export async function createCropHealthNote(
    data: CreateCropHealthNoteData
): Promise<void> {
    const formData = new FormData();

    // Required fields
    formData.append("fieldId", data.fieldId);
    formData.append("noteDate", data.noteDate);

    // Optional fields
    if (data.healthStatus) {
        formData.append("healthStatus", data.healthStatus);
    }
    if (data.description?.trim()) {
        formData.append("description", data.description.trim());
    }
    if (data.actionTaken?.trim()) {
        formData.append("actionTaken", data.actionTaken.trim());
    }

    // Append images and their notes with index-based mapping
    if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
            const note = data.imageNotes?.[index]?.trim() || "";
            formData.append(`imageNotes[${index}]`, note);
        });
    }

    await api.post("/api/v1/crop-health-notes", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * Update an existing crop health note
 * Supports:
 * - Updating notes for existing images (without re-uploading)
 * - Deleting specific images
 * - Adding new images
 * - Updating other note fields
 */
export async function updateCropHealthNote(
    noteId: string,
    data: UpdateCropHealthNoteData
): Promise<void> {
    const formData = new FormData();

    // All fields are optional for update
    if (data.fieldId) {
        formData.append("fieldId", data.fieldId);
    }
    if (data.noteDate) {
        formData.append("noteDate", data.noteDate);
    }
    if (data.healthStatus !== undefined) {
        formData.append("healthStatus", data.healthStatus || "");
    }
    if (data.description !== undefined) {
        formData.append("description", data.description?.trim() || "");
    }
    if (data.actionTaken !== undefined) {
        formData.append("actionTaken", data.actionTaken?.trim() || "");
    }

    // Add new images with index-based mapping
    if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
            const note = data.imageNotes?.[index]?.trim() || "";
            formData.append(`imageNotes[${index}]`, note);
        });
    }

    // Update notes for existing images (only send if there are changes)
    if (data.existingImageNotes && Object.keys(data.existingImageNotes).length > 0) {
        const existingImageNotesArray = Object.entries(data.existingImageNotes).map(([id, notes]) => ({
            id,
            notes: notes || null,
        }));
        formData.append("existingImageNotes", JSON.stringify(existingImageNotesArray));
    }

    // Delete specific images
    if (data.deletedImageKeys && data.deletedImageKeys.length > 0) {
        formData.append("deleteImageIds", JSON.stringify(data.deletedImageKeys));
    }

    await api.put(`/api/v1/crop-health-notes/${noteId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * Delete a crop health note
 */
export async function deleteCropHealthNote(noteId: string): Promise<void> {
    await api.delete(`/api/v1/crop-health-notes/${noteId}`);
}

