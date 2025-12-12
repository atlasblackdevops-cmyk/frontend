"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { BaseInput, BaseDateInput, BaseSelect } from "@/components/ui";
import type { AddAnimalValues } from "../types";
import { GENDER_OPTIONS } from "../types";
import {
  getSpecies,
  getBreeds,
  type Species,
  type Breed,
} from "@/lib/livestock/api";

interface AddAnimalModalProps {
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
}

export default function AddAnimalModal({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: AddAnimalModalProps) {
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
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      species: (value) =>
        value.trim().length === 0 ? "Species is required" : null,
      breed: (value) =>
        value.trim().length === 0 ? "Breed is required" : null,
      gender: (value) => (!value ? "Select sex / gender" : null),
      birthdate: (value) => (!value ? "Birthdate is required" : null),
    },
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [breedsList, setBreedsList] = useState<Breed[]>([]);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

  // Fetch species on mount
  useEffect(() => {
    if (opened) {
      fetchSpecies();
    }
  }, [opened]);

  // Fetch breeds when species changes
  useEffect(() => {
    const selectedSpecies = form.values.species;
    if (selectedSpecies && opened) {
      fetchBreeds(selectedSpecies);
    } else {
      setBreedsList([]);
      form.setFieldValue("breed", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.species, opened]);

  const fetchSpecies = async () => {
    setIsLoadingSpecies(true);
    try {
      const species = await getSpecies();
      setSpeciesList(species);
    } catch (error) {
      console.error("Failed to fetch species:", error);
      setSpeciesList([]);
    } finally {
      setIsLoadingSpecies(false);
    }
  };

  const fetchBreeds = async (speciesId: string) => {
    setIsLoadingBreeds(true);
    try {
      const breeds = await getBreeds(speciesId);
      setBreedsList(breeds);
    } catch (error) {
      console.error("Failed to fetch breeds:", error);
      setBreedsList([]);
    } finally {
      setIsLoadingBreeds(false);
    }
  };

  const resetAndClose = () => {
    form.reset();
    setPhotoPreview(null);
    setBreedsList([]);
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
            species: values.species,
            breed: values.breed,
            gender: values.gender,
            birthdate: values.birthdate,
            photo: values.photo,
          });
        //   resetAndClose();
        })}
      >
        <Stack gap="md">
          <Group align="center" gap="md">
            <Avatar src={photoPreview} size={72} radius="md" variant="light">
              {!photoPreview &&
                (form.values.name?.[0]?.toUpperCase() || (
                  <IconPhoto size={32} />
                ))}
            </Avatar>
            <FileInput
              placeholder="Upload animal photo"
              leftSection={
                <IconUpload style={{ cursor: "pointer" }} size={16} />
              }
              accept="image/png,image/jpeg,image/webp"
              value={form.values.photo}
              onChange={handleFileChange}
              clearable
            />
          </Group>
          <BaseInput
            label="Name"
            placeholder="e.g. Daisy"
            required
            {...form.getInputProps("name")}
          />
          <BaseSelect
            label="Species"
            placeholder="Select species"
            data={speciesList.map((species) => ({
              value: species.id,
              label: species.name,
            }))}
            required
            disabled={isLoadingSpecies}
            searchable
            {...form.getInputProps("species")}
            onChange={(value) => {
                form.setFieldValue("breed", "");
                setBreedsList([]);
                form.setFieldValue("species", value || "");
            }}
          />
          <BaseSelect
            key={form.values.species || "no-species"}
            label="Breed"
            placeholder="Select breed"
            data={breedsList.map((breed) => ({
              value: breed.id,
              label: breed.name,
            }))}
            required
            disabled={!form.values.species || isLoadingBreeds}
            searchable
            value={form.values.breed || null}
            onChange={(value) => {
              form.setFieldValue("breed", value || "");
            }}
            error={form.errors.breed}
          />
          <Select
            label="Sex / gender"
            placeholder="Select"
            data={GENDER_OPTIONS.filter((opt) => opt.value !== "all")}
            required
            {...form.getInputProps("gender")}
          />
          <BaseDateInput
            label="Birthdate"
            placeholder="Select birthdate"
            required
            value={form.values.birthdate || ""}
            onChange={(date) => {
              form.setFieldValue("birthdate", date || "");
            }}
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
}
