"use client";

import { useState } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    AnimalRecord,
    PaginationInfo,
    FilterValues,
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

export function useAnimals() {
    const { farmId } = useAuth();
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchAnimals = async (
        page: number = 1,
        filters?: {
            search?: string;
            gender?: string;
            birthdateFrom?: string;
            birthdateTo?: string;
        }
    ) => {
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
            const responseData = response.data ?? response;
            const animalsData = responseData?.animals ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };
            // Map API response to AnimalRecord format
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
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch animals"
            );
            setAnimals([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnimalDetails = async (
        animalId: string
    ): Promise<AnimalRecord | null> => {
        if (!farmId) {
            setError("Farm ID is required");
            return null;
        }

        try {
            return await getAnimalDetails(animalId);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch animal details"
            );
            return null;
        }
    };

    const handleCreateAnimal = async (data: CreateAnimalData): Promise<void> => {
        if (!farmId) {
            throw new Error("Farm ID is required");
        }

        setError(null);
        await createAnimal(data);
        // Refresh the list
        await fetchAnimals(pagination.page);
    };

    const handleUpdateAnimal = async (
        animalId: string,
        data: CreateAnimalData
    ): Promise<void> => {
        if (!farmId) {
            throw new Error("Farm ID is required");
        }

        setError(null);
        await updateAnimal(animalId, data);
        // Refresh the list
        await fetchAnimals(pagination.page);
    };

    const handleDeleteAnimal = async (animalId: string): Promise<void> => {
        if (!farmId) {
            throw new Error("Farm ID is required");
        }

        setError(null);
        await deleteAnimal(animalId);
        // Refresh the list
        await fetchAnimals(pagination.page);
    };

    return {
        animals,
        isLoading,
        pagination,
        error,
        fetchAnimals,
        fetchAnimalDetails,
        createAnimal: handleCreateAnimal,
        updateAnimal: handleUpdateAnimal,
        deleteAnimal: handleDeleteAnimal,
        setPagination,
    };
}

