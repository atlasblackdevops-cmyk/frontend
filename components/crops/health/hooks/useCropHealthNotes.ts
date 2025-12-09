"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import {
    getCropHealthNotes,
    getCropHealthNoteDetails,
    createCropHealthNote,
    updateCropHealthNote,
    deleteCropHealthNote,
} from "@/lib/crops/health/api";
import type {
    CropHealthNoteRecord,
    PaginationInfo,
    GetCropHealthNotesParams,
    CreateCropHealthNoteData,
    UpdateCropHealthNoteData,
} from "../types";

interface UseCropHealthNotesResult {
    notes: CropHealthNoteRecord[];
    isLoading: boolean;
    pagination: PaginationInfo;
    error: string | null;
    fetchNotes: (
        page: number,
        params?: Partial<GetCropHealthNotesParams>
    ) => Promise<boolean>;
    fetchNoteDetails: (noteId: string) => Promise<CropHealthNoteRecord | null>;
    createNote: (data: CreateCropHealthNoteData) => Promise<boolean>;
    updateNote: (
        noteId: string,
        data: UpdateCropHealthNoteData
    ) => Promise<boolean>;
    deleteNote: (noteId: string) => Promise<boolean>;
    setPagination: (pagination: PaginationInfo) => void;
}

export function useCropHealthNotes(): UseCropHealthNotesResult {
    const { farmId } = useAuth();
    const [notes, setNotes] = useState<CropHealthNoteRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchNotes = useCallback(
        async (
            page: number,
            params?: Partial<GetCropHealthNotesParams>
        ): Promise<boolean> => {
            if (!farmId) {
                setError("Farm ID is required");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await getCropHealthNotes({
                    farmId,
                    page,
                    limit: pagination.limit,
                    ...params,
                });

                setNotes(result.notes);
                setPagination(result.pagination);
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch crop health notes";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchNoteDetails = useCallback(
        async (noteId: string): Promise<CropHealthNoteRecord | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const note = await getCropHealthNoteDetails(noteId);
                return note;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch crop health note details";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createNote = useCallback(
        async (data: CreateCropHealthNoteData): Promise<boolean> => {
            if (!farmId) {
                setError("Farm ID is required");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                await createCropHealthNote({
                    ...data,
                    farmId,
                });
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to create crop health note";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [farmId]
    );

    const updateNote = useCallback(
        async (
            noteId: string,
            data: UpdateCropHealthNoteData
        ): Promise<boolean> => {
            setIsLoading(true);
            setError(null);

            try {
                await updateCropHealthNote(noteId, data);
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to update crop health note";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteNote = useCallback(
        async (noteId: string): Promise<boolean> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteCropHealthNote(noteId);
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to delete crop health note";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        notes,
        isLoading,
        pagination,
        error,
        fetchNotes,
        fetchNoteDetails,
        createNote,
        updateNote,
        deleteNote,
        setPagination,
    };
}

