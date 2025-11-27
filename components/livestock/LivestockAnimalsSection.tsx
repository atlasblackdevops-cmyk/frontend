"use client";

import { useState, useEffect } from "react";
import {
    Avatar,
    Badge,
    Button,
    FileInput,
    Group,
    Modal,
    Paper,
    Select,
    Stack,
    Table,
    Tabs,
    Text,
    TextInput,
    Title,
    SimpleGrid,
    Loader,
    Pagination,
    Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconPhoto,
    IconPlus,
    IconUpload,
    IconSearch,
    IconX,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

type AnimalRecord = {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: "Male" | "Female" | "Unknown";
    birthdate: string;
    photo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type ApiAnimalResponse = {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthdate: string;
    photo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
    updatedBy?: {
        id: string;
        name: string;
        email: string;
    };
};

type AnimalsApiResponse = {
    message: string;
    data: {
        animals: ApiAnimalResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

type AddAnimalValues = {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthdate: string;
    photo: File | null;
};

const genderOptions = [
    { value: "all", label: "All" },
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Unknown", label: "Unknown" },
];

const formatDate = (value: string) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(value));
    } catch {
        return value;
    }
};

const AddAnimalModal = ({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => Promise<void>;
    isSubmitting: boolean;
}) => {
    const form = useForm<AddAnimalValues>({
        initialValues: {
            name: "",
            species: "",
            breed: "",
            gender: "",
            birthdate: "",
            photo: null,
        },
        validate: {
            name: (value) =>
                value.trim().length < 2
                    ? "Name must be at least 2 characters"
                    : null,
            species: (value) =>
                value.trim().length === 0 ? "Species is required" : null,
            breed: (value) =>
                value.trim().length === 0 ? "Breed is required" : null,
            gender: (value) => (!value ? "Select sex / gender" : null),
            birthdate: (value) => (!value ? "Birthdate is required" : null),
        },
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const resetAndClose = () => {
        form.reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleFileChange = (file: File | null) => {
        form.setFieldValue("photo", file);
        if (!file) {
            setPhotoPreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Add animal"
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name.trim(),
                        species: values.species.trim(),
                        breed: values.breed.trim(),
                        gender: values.gender,
                        birthdate: values.birthdate,
                        photo: values.photo,
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <Group align="flex-end" gap="md">
                        <Avatar
                            src={photoPreview}
                            size={72}
                            radius="md"
                            variant="light"
                        >
                            {!photoPreview &&
                                (form.values.name?.[0]?.toUpperCase() || (
                                    <IconPhoto size={32} />
                                ))}
                        </Avatar>
                        <FileInput
                            label="Photo"
                            placeholder="Upload animal photo"
                            leftSection={<IconUpload size={16} />}
                            accept="image/png,image/jpeg,image/webp"
                            value={form.values.photo}
                            onChange={handleFileChange}
                            clearable
                        />
                    </Group>
                    <TextInput
                        label="Name"
                        placeholder="e.g. Daisy"
                        required
                        {...form.getInputProps("name")}
                    />
                    <TextInput
                        label="Species"
                        placeholder="e.g. Cattle"
                        required
                        {...form.getInputProps("species")}
                    />
                    <TextInput
                        label="Breed"
                        placeholder="e.g. Jersey"
                        required
                        {...form.getInputProps("breed")}
                    />
                    <Select
                        label="Sex / gender"
                        placeholder="Select"
                        data={genderOptions.filter(
                            (opt) => opt.value !== "all"
                        )}
                        required
                        {...form.getInputProps("gender")}
                    />
                    <TextInput
                        label="Birthdate"
                        type="date"
                        required
                        {...form.getInputProps("birthdate")}
                    />
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Save animal
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

type AnimalDetailsResponse = {
    message: string;
    data: {
        animal: ApiAnimalResponse;
    };
};

const UpdateAnimalModal = ({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    animal,
}: {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => Promise<void>;
    isSubmitting: boolean;
    animal: AnimalRecord | null;
}) => {
    const form = useForm<AddAnimalValues>({
        initialValues: {
            name: "",
            species: "",
            breed: "",
            gender: "",
            birthdate: "",
            photo: null,
        },
        validate: {
            name: (value) =>
                value.trim().length < 2
                    ? "Name must be at least 2 characters"
                    : null,
            species: (value) =>
                value.trim().length === 0 ? "Species is required" : null,
            breed: (value) =>
                value.trim().length === 0 ? "Breed is required" : null,
            gender: (value) => (!value ? "Select sex / gender" : null),
            birthdate: (value) => (!value ? "Birthdate is required" : null),
        },
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Load animal data when modal opens
    useEffect(() => {
        if (opened && animal) {
            form.setValues({
                name: animal.name,
                species: animal.species,
                breed: animal.breed,
                gender: animal.gender,
                birthdate: animal.birthdate,
                photo: null,
            });
            setPhotoPreview(animal.photo);
        } else if (!opened) {
            // Reset form when modal closes
            form.reset();
            setPhotoPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, animal?.id]);

    const resetAndClose = () => {
        form.reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleFileChange = (file: File | null) => {
        form.setFieldValue("photo", file);
        if (!file) {
            // If clearing file, restore original photo if exists
            setPhotoPreview(animal?.photo || null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            opened={opened}
            onClose={resetAndClose}
            title="Update animal"
            centered
            size="lg"
        >
            <form
                onSubmit={form.onSubmit(async (values) => {
                    await onSubmit({
                        name: values.name.trim(),
                        species: values.species.trim(),
                        breed: values.breed.trim(),
                        gender: values.gender,
                        birthdate: values.birthdate,
                        photo: values.photo,
                    });
                    resetAndClose();
                })}
            >
                <Stack gap="md">
                    <Group align="flex-end" gap="md">
                        <Avatar
                            src={photoPreview}
                            size={72}
                            radius="md"
                            variant="light"
                        >
                            {!photoPreview &&
                                (form.values.name?.[0]?.toUpperCase() || (
                                    <IconPhoto size={32} />
                                ))}
                        </Avatar>
                        <FileInput
                            label="Photo"
                            placeholder="Upload animal photo"
                            leftSection={<IconUpload size={16} />}
                            accept="image/png,image/jpeg,image/webp"
                            value={form.values.photo}
                            onChange={handleFileChange}
                            clearable
                        />
                    </Group>
                    <TextInput
                        label="Name"
                        placeholder="e.g. Daisy"
                        required
                        {...form.getInputProps("name")}
                    />
                    <TextInput
                        label="Species"
                        placeholder="e.g. Cattle"
                        required
                        {...form.getInputProps("species")}
                    />
                    <TextInput
                        label="Breed"
                        placeholder="e.g. Jersey"
                        required
                        {...form.getInputProps("breed")}
                    />
                    <Select
                        label="Sex / gender"
                        placeholder="Select"
                        data={genderOptions.filter(
                            (opt) => opt.value !== "all"
                        )}
                        required
                        {...form.getInputProps("gender")}
                    />
                    <TextInput
                        label="Birthdate"
                        type="date"
                        required
                        {...form.getInputProps("birthdate")}
                    />
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Update animal
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

type FilterValues = {
    search: string;
    gender: string;
    birthdateFrom: string;
    birthdateTo: string;
};

type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export default function LivestockAnimalsSection() {
    const { farmId, permissions, role } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>("animals");

    // Permission checks
    const canList =
        hasPermission("LIVESTOCK", "LIST", permissions, role) ||
        hasPermission("LIVESTOCK", "READ", permissions, role);
    const canCreate = hasPermission("LIVESTOCK", "CREATE", permissions, role);
    const canUpdate = hasPermission("LIVESTOCK", "UPDATE", permissions, role);
    const canDelete = hasPermission("LIVESTOCK", "DELETE", permissions, role);
    const [animals, setAnimals] = useState<AnimalRecord[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(
        null
    );
    const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const filterForm = useForm<FilterValues>({
        initialValues: {
            search: "",
            gender: "all",
            birthdateFrom: "",
            birthdateTo: "",
        },
    });

    const fetchAnimals = async (
        page: number = 1,
        filters?: {
            search?: string;
            gender?: string;
            birthdateFrom?: string;
            birthdateTo?: string;
        }
    ) => {
        if (!farmId) return;

        // Check if user has LIST or READ permission
        if (!canList) {
            setError("You don't have permission to view the listing");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", pagination.limit.toString());

            // Use provided filters or fall back to form values
            const searchValue = filters?.search ?? filterForm.values.search;
            const genderValue = filters?.gender ?? filterForm.values.gender;
            const birthdateFromValue =
                filters?.birthdateFrom ?? filterForm.values.birthdateFrom;
            const birthdateToValue =
                filters?.birthdateTo ?? filterForm.values.birthdateTo;

            if (searchValue?.trim()) {
                params.append("search", searchValue.trim());
            }

            if (genderValue && genderValue !== "all") {
                params.append("gender", genderValue);
            }

            if (birthdateFromValue) {
                params.append("birthdateFrom", birthdateFromValue);
            }

            if (birthdateToValue) {
                params.append("birthdateTo", birthdateToValue);
            }

            const response = await api.get<AnimalsApiResponse>(
                `/api/v1/animals?${params.toString()}`
            );

            const responseData = response.data?.data ?? response.data;
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
                species: animal.species,
                breed: animal.breed,
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

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchAnimals(1, {
            search: filterForm.values.search,
            gender: filterForm.values.gender,
            birthdateFrom: filterForm.values.birthdateFrom,
            birthdateTo: filterForm.values.birthdateTo,
        });
    };

    const handleAddAnimal = async (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => {
        if (!farmId) {
            setError("Farm ID is required");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("species", values.species);
            formData.append("breed", values.breed);
            formData.append("gender", values.gender);
            formData.append("birthdate", values.birthdate);
            if (values.photo) {
                formData.append("image", values.photo);
            }

            await api.post("/api/v1/animals", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccessMessage("Animal added successfully");
            // Refresh the list
            await fetchAnimals(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to add animal"
            );
            throw err; // Re-throw to prevent modal from closing
        } finally {
            setIsSubmitting(false);
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
            const response = await api.get<AnimalDetailsResponse>(
                `/api/v1/animals/${animalId}`
            );

            const responseData = response.data?.data ?? response.data;
            const animalData = responseData?.animal;
            if (!animalData) {
                throw new Error("Animal data not found");
            }

            return {
                id: animalData.id,
                name: animalData.name,
                species: animalData.species,
                breed: animalData.breed,
                gender: animalData.gender as "Male" | "Female" | "Unknown",
                birthdate: animalData.birthdate,
                photo: animalData.photo,
                isActive: animalData.isActive,
                createdAt: animalData.createdAt,
                updatedAt: animalData.updatedAt,
            };
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch animal details"
            );
            return null;
        }
    };

    const handleUpdate = async (animal: AnimalRecord) => {
        if (!canUpdate) {
            setError("You don't have permission to update animals");
            return;
        }

        setError(null);
        setSelectedAnimal(animal);
        setUpdateModalOpen(true);
    };

    const handleUpdateAnimal = async (values: {
        name: string;
        species: string;
        breed: string;
        gender: string;
        birthdate: string;
        photo: File | null;
    }) => {
        if (!farmId || !selectedAnimal) {
            setError("Farm ID and animal ID are required");
            return;
        }

        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("species", values.species);
            formData.append("breed", values.breed);
            formData.append("gender", values.gender);
            formData.append("birthdate", values.birthdate);
            if (values.photo) {
                formData.append("image", values.photo);
            }

            await api.put(`/api/v1/animals/${selectedAnimal.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccessMessage("Animal updated successfully");
            // Refresh the list
            await fetchAnimals(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to update animal"
            );
            throw err; // Re-throw to prevent modal from closing
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (animal: AnimalRecord) => {
        if (!canDelete) {
            setError("You don't have permission to delete animals");
            return;
        }
        setAnimalToDelete(animal);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!farmId || !animalToDelete) {
            setError("Farm ID and animal ID are required");
            return;
        }

        setIsDeleting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await api.delete(`/api/v1/animals/${animalToDelete.id}`);
            setSuccessMessage("Animal deleted successfully");
            setDeleteModalOpen(false);
            setAnimalToDelete(null);
            // Refresh the list
            await fetchAnimals(pagination.page);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to delete animal"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // Load animals on mount and when farmId changes (only if user has LIST permission)
    useEffect(() => {
        if (farmId && canList) {
            fetchAnimals(1);
        }
    }, [farmId, canList]);

    // Clear notifications after 5 seconds
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    return (
        <Stack gap="lg">
            <div>
                <Title order={2}>Livestock</Title>
                <Text c="dimmed" size="sm">
                    Manage animals across your farm.
                </Text>
            </div>

            <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value ?? "animals")}
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab value="animals">Animals</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {activeTab === "animals" && (
                <Stack gap="md">
                    {error && (
                        <Notification
                            icon={<IconX size={18} />}
                            color="red"
                            title="Error"
                            onClose={() => setError(null)}
                            withCloseButton
                        >
                            {error}
                        </Notification>
                    )}

                    {successMessage && (
                        <Notification
                            color="green"
                            title="Success"
                            onClose={() => setSuccessMessage(null)}
                            withCloseButton
                        >
                            {successMessage}
                        </Notification>
                    )}

                    <Group justify="space-between" align="center">
                        <div>
                            <Title order={3}>Animals</Title>
                            <Text size="sm" c="dimmed">
                                View existing livestock records and add new
                                animals.
                            </Text>
                        </div>
                        {canCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setModalOpen(true)}
                            >
                                Add animal
                            </Button>
                        )}
                    </Group>

                    {canList && (
                        <Paper withBorder p="md" radius="md">
                            <Stack gap="md">
                                <SimpleGrid
                                    cols={{ base: 1, sm: 2, md: 4 }}
                                    spacing="md"
                                >
                                    <TextInput
                                        label="Search"
                                        placeholder="Search by name, species, breed..."
                                        leftSection={<IconSearch size={16} />}
                                        {...filterForm.getInputProps("search")}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <Select
                                        label="Gender"
                                        placeholder="Select gender"
                                        data={genderOptions}
                                        {...filterForm.getInputProps("gender")}
                                    />
                                    <TextInput
                                        label="Birthdate From"
                                        type="date"
                                        {...filterForm.getInputProps(
                                            "birthdateFrom"
                                        )}
                                    />
                                    <TextInput
                                        label="Birthdate To"
                                        type="date"
                                        {...filterForm.getInputProps(
                                            "birthdateTo"
                                        )}
                                    />
                                </SimpleGrid>
                                <Group justify="flex-end">
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            filterForm.reset();
                                            setPagination((prev) => ({
                                                ...prev,
                                                page: 1,
                                            }));
                                            // Fetch with cleared filters immediately
                                            fetchAnimals(1, {
                                                search: "",
                                                gender: "all",
                                                birthdateFrom: "",
                                                birthdateTo: "",
                                            });
                                        }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        leftSection={<IconSearch size={16} />}
                                        onClick={handleSearch}
                                        loading={isLoading}
                                    >
                                        Search
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    )}

                    {canList ? (
                        <Paper withBorder p="md" radius="md">
                            <div style={{ width: "100%", overflowX: "auto" }}>
                                <Table
                                    verticalSpacing="sm"
                                    highlightOnHover
                                    style={{
                                        width: "100%",
                                        minWidth: 720,
                                        tableLayout: "fixed",
                                    }}
                                >
                                    <colgroup>
                                        <col style={{ width: "20%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "15%" }} />
                                        {(canUpdate || canDelete) && (
                                            <col style={{ width: "25%" }} />
                                        )}
                                    </colgroup>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Animal</Table.Th>
                                            <Table.Th>Species</Table.Th>
                                            <Table.Th>Breed</Table.Th>
                                            <Table.Th>Sex</Table.Th>
                                            <Table.Th>Birthdate</Table.Th>
                                            {(canUpdate || canDelete) && (
                                                <Table.Th
                                                    style={{
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    Actions
                                                </Table.Th>
                                            )}
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {isLoading ? (
                                            <Table.Tr>
                                                <Table.Td
                                                    colSpan={
                                                        5 +
                                                        (canUpdate || canDelete
                                                            ? 1
                                                            : 0)
                                                    }
                                                >
                                                    <Group
                                                        justify="center"
                                                        p="xl"
                                                    >
                                                        <Loader size="sm" />
                                                        <Text c="dimmed">
                                                            Loading animals...
                                                        </Text>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : animals.length === 0 ? (
                                            <Table.Tr>
                                                <Table.Td
                                                    colSpan={
                                                        5 +
                                                        (canUpdate || canDelete
                                                            ? 1
                                                            : 0)
                                                    }
                                                >
                                                    <Text
                                                        c="dimmed"
                                                        ta="center"
                                                    >
                                                        No animals found. Use
                                                        "Add animal" to create
                                                        your first entry or
                                                        adjust your search
                                                        filters.
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : (
                                            animals.map((animal) => (
                                                <Table.Tr key={animal.id}>
                                                    <Table.Td>
                                                        <Group gap="sm">
                                                            <Avatar
                                                                src={
                                                                    animal.photo
                                                                }
                                                                radius="xl"
                                                                size={42}
                                                            >
                                                                {!animal.photo &&
                                                                    animal.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                            </Avatar>
                                                            <div>
                                                                <Text fw={600}>
                                                                    {
                                                                        animal.name
                                                                    }
                                                                </Text>
                                                            </div>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {animal.species}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {animal.breed}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge
                                                            color={
                                                                animal.gender ===
                                                                "Female"
                                                                    ? "pink"
                                                                    : animal.gender ===
                                                                        "Male"
                                                                      ? "blue"
                                                                      : "gray"
                                                            }
                                                        >
                                                            {animal.gender}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {formatDate(
                                                            animal.birthdate
                                                        )}
                                                    </Table.Td>
                                                    {(canUpdate ||
                                                        canDelete) && (
                                                        <Table.Td
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            <Group
                                                                gap="xs"
                                                                justify="flex-end"
                                                            >
                                                                {canUpdate && (
                                                                    <Button
                                                                        variant="subtle"
                                                                        size="xs"
                                                                        leftSection={
                                                                            <IconEdit
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        }
                                                                        onClick={() =>
                                                                            handleUpdate(
                                                                                animal
                                                                            )
                                                                        }
                                                                    >
                                                                        Update
                                                                    </Button>
                                                                )}
                                                                {canDelete && (
                                                                    <Button
                                                                        variant="subtle"
                                                                        color="red"
                                                                        size="xs"
                                                                        leftSection={
                                                                            <IconTrash
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        }
                                                                        onClick={() =>
                                                                            handleDeleteClick(
                                                                                animal
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </Group>
                                                        </Table.Td>
                                                    )}
                                                </Table.Tr>
                                            ))
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </div>
                        </Paper>
                    ) : (
                        <Paper withBorder p="xl" radius="md">
                            <Text c="dimmed" ta="center">
                                You don't have permission to view the animal
                                listing.
                            </Text>
                        </Paper>
                    )}

                    {canList && pagination.totalPages > 1 && (
                        <Group justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                Showing {animals.length} of {pagination.total}{" "}
                                animals
                            </Text>
                            <Pagination
                                value={pagination.page}
                                onChange={(page) => {
                                    setPagination((prev) => ({
                                        ...prev,
                                        page,
                                    }));
                                    fetchAnimals(page);
                                }}
                                total={pagination.totalPages}
                                size="sm"
                            />
                        </Group>
                    )}
                </Stack>
            )}

            <AddAnimalModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddAnimal}
                isSubmitting={isSubmitting}
            />

            <UpdateAnimalModal
                opened={updateModalOpen}
                onClose={() => {
                    setUpdateModalOpen(false);
                    setSelectedAnimal(null);
                }}
                onSubmit={handleUpdateAnimal}
                isSubmitting={isUpdating}
                animal={selectedAnimal}
            />

            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setAnimalToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Animal"
                itemName={animalToDelete?.name || ""}
                itemType="animal"
                isDeleting={isDeleting}
            />
        </Stack>
    );
}
