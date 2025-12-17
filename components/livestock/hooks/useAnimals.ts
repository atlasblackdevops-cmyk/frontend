"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    AnimalRecord,
    PaginationInfo,
} from "../types";
import {
    getAnimals,
    getAnimalDetails,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    type GetAnimalsParams,
    type CreateAnimalData,
} from "@/lib/livestock/api";

interface FetchAnimalsFilters {
    search?: string;
    gender?: string;
    birthdateFrom?: string;
    birthdateTo?: string;
}

interface MutationResult {
    success: boolean;
    data?: AnimalRecord;
    error?: string;
}

const DEFAULT_PAGINATION: PaginationInfo = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

function extractErrorMessage(err: any, defaultMessage: string): string {
    return (
        err?.response?.data?.message ??
        err?.message ??
        defaultMessage
    );
}


export function useAnimals() {
    const { farmId } = useAuth();
    
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchAnimals = useCallback(
        async (page: number = 1, filters?: FetchAnimalsFilters) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetAnimalsParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await getAnimals(params);
                const responseData = response?.data ?? {};
                const animalsData = responseData?.animals ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                // Transform animals data - API already returns mapped data
                const mappedAnimals: AnimalRecord[] = animalsData.map((animal) => ({
                    id: animal.id,
                    name: animal.name,
                    species: animal.speciesRelation.name,
                    breed: animal.breedRelation.name,
                    gender: animal.gender as "Male" | "Female" | "Unknown",
                    birthdate: animal.birthdate,
                    photo: animal.photo,
                    isActive: animal.isActive,
                    createdAt: animal.createdAt,
                    updatedAt: animal.updatedAt,
                }));

                setAnimals(mappedAnimals);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch animals");
                setError(errorMessage);
                setAnimals([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchAnimalDetails = useCallback(
        async (animalId: string): Promise<AnimalRecord | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const animal = await getAnimalDetails(animalId);
                return animal;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch animal details");
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createAnimalRecord = useCallback(
        async (data: CreateAnimalData): Promise<MutationResult> => {
            if (!farmId) {
                const errorMsg = "Farm ID is required";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            setIsLoading(true);
            setError(null);

            try {
                await createAnimal(data);
                
                await fetchAnimals(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create animal");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.page, fetchAnimals]
    );

    const updateAnimalRecord = useCallback(
        async (animalId: string, data: CreateAnimalData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await updateAnimal(animalId, data);

                await fetchAnimals(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update animal");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchAnimals]
    );

    const deleteAnimalRecord = useCallback(
        async (animalId: string): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteAnimal(animalId);
                
                await fetchAnimals(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to delete animal");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchAnimals]
    );

    return {
        animals,
        isLoading,
        pagination,
        error,
        fetchAnimals,
        fetchAnimalDetails,
        createAnimal: createAnimalRecord,
        updateAnimal: updateAnimalRecord,
        deleteAnimal: deleteAnimalRecord,
        setPagination,
    };
}

