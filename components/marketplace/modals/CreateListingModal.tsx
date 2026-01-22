"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  FileInput,
  Group,
  Modal,
  Stack,
  SimpleGrid,
  Image,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { BaseInput, BaseSelect, BaseNumberInput, BaseTextarea } from "@/components/ui";
import { Checkbox } from "@mantine/core";
import type { CreateListingValues, CreateListingModalProps } from "../types";
import { LISTING_CATEGORY_OPTIONS, LISTING_STATUS_OPTIONS } from "../types";

export default function CreateListingModal({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateListingModalProps) {
  const form = useForm<CreateListingValues>({
    initialValues: {
      title: "",
      description: "",
      category: "produce",
      price: "",
      quantityAvailable: "",
      quantityUnit: "kg",
      city: "",
      state: "",
      country: "",
      shippingAvailable: false,
      status: "active",
      photos: [],
    },
    validate: {
      title: (value) =>
        value.trim().length < 2 ? "Title must be at least 2 characters" : null,
      price: (value) =>
        value === "" || Number(value) < 0 ? "Price must be a positive number" : null,
      quantityAvailable: (value) =>
        value === "" || Number(value) < 0 ? "Quantity must be a positive number" : null,
    },
  });

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const resetAndClose = () => {
    form.reset();
    setPhotoPreviews([]);
    onClose();
  };

  const handleFileChange = (files: File[] | null) => {
    if (!files) {
      form.setFieldValue("photos", []);
      setPhotoPreviews([]);
      return;
    }

    const fileArray = Array.from(files);
    form.setFieldValue("photos", fileArray);

    // Create previews
    const previews: string[] = [];
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === fileArray.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = form.values.photos.filter((_, i) => i !== index);
    form.setFieldValue("photos", newPhotos);
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: CreateListingValues) => {
    await onSubmit(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      title="Create Listing"
      centered
      size="lg"
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          await handleSubmit({
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category,
            price: values.price,
            quantityAvailable: values.quantityAvailable,
            quantityUnit: values.quantityUnit,
            city: values.city.trim(),
            state: values.state.trim(),
            country: values.country.trim(),
            shippingAvailable: values.shippingAvailable,
            status: values.status,
            photos: values.photos,
          });
        })}
      >
        <Stack gap="md">
          {/* Photo Upload */}
          <div>
            <FileInput
              label="Photos"
              placeholder="Upload photos (multiple)"
              leftSection={<IconUpload size={16} />}
              accept="image/png,image/jpeg,image/webp"
              multiple
              value={form.values.photos as any}
              onChange={(files) => handleFileChange(files as File[] | null)}
              clearable
            />
            {photoPreviews.length > 0 && (
              <SimpleGrid cols={3} mt="sm">
                {photoPreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      radius="md"
                      h={100}
                      fit="cover"
                    />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      radius="xl"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                      }}
                      onClick={() => removePhoto(index)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </div>
                ))}
              </SimpleGrid>
            )}
          </div>

          <BaseInput
            label="Title"
            placeholder="e.g. Fresh Organic Tomatoes"
            required
            {...form.getInputProps("title")}
          />

          <BaseTextarea
            label="Description"
            placeholder="Describe your listing..."
            rows={4}
            {...form.getInputProps("description")}
          />

          <SimpleGrid cols={2}>
            <BaseSelect
              label="Category"
              placeholder="Select category"
              data={LISTING_CATEGORY_OPTIONS.filter((opt) => opt.value !== "all")}
              required
              {...form.getInputProps("category")}
            />

            <BaseSelect
              label="Status"
              placeholder="Select status"
              data={LISTING_STATUS_OPTIONS.filter((opt) => opt.value !== "all")}
              required
              {...form.getInputProps("status")}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <BaseNumberInput
              label="Price"
              placeholder="0.00"
              required
              min={0}
              decimalScale={2}
              {...form.getInputProps("price")}
            />

            <BaseNumberInput
              label="Quantity Available"
              placeholder="0"
              required
              min={0}
              {...form.getInputProps("quantityAvailable")}
            />
          </SimpleGrid>

          <BaseSelect
            label="Quantity Unit"
            placeholder="Select unit"
            data={[
              { value: "kg", label: "Kilograms (kg)" },
              { value: "g", label: "Grams (g)" },
              { value: "lbs", label: "Pounds (lbs)" },
              { value: "oz", label: "Ounces (oz)" },
              { value: "ton", label: "Tons" },
              { value: "mt", label: "Metric Tons" },
              { value: "l", label: "Liters (l)" },
              { value: "ml", label: "Milliliters (ml)" },
              { value: "gal", label: "Gallons (gal)" },
              { value: "pieces", label: "Pieces" },
              { value: "bags", label: "Bags" },
              { value: "boxes", label: "Boxes" },
              { value: "crates", label: "Crates" },
              { value: "bundles", label: "Bundles" },
            ]}
            {...form.getInputProps("quantityUnit")}
          />

          <SimpleGrid cols={3}>
            <BaseInput
              label="City"
              placeholder="City"
              {...form.getInputProps("city")}
            />
            <BaseInput
              label="State"
              placeholder="State"
              {...form.getInputProps("state")}
            />
            <BaseInput
              label="Country"
              placeholder="Country"
              {...form.getInputProps("country")}
            />
          </SimpleGrid>

          <Checkbox
            label="Shipping Available"
            {...form.getInputProps("shippingAvailable", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Listing
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

