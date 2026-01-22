"use client";

import { useState, useEffect } from "react";
import {
  Button,
  FileInput,
  Group,
  Modal,
  Stack,
  SimpleGrid,
  Image,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload, IconX } from "@tabler/icons-react";
import { BaseInput, BaseSelect, BaseNumberInput, BaseTextarea } from "@/components/ui";
import type { UpdateListingValues, EditListingModalProps, ListingRecord } from "../types";
import { LISTING_CATEGORY_OPTIONS, LISTING_STATUS_OPTIONS } from "../types";

export default function EditListingModal({
  opened,
  onClose,
  listing,
  onSubmit,
  isSubmitting,
}: EditListingModalProps) {
  const form = useForm<UpdateListingValues>({
    initialValues: {
      title: "",
      description: "",
      category: "produce",
      price: "",
      quantityAvailable: "",
      quantityUnit: "",
      city: "",
      state: "",
      country: "",
      shippingAvailable: false,
      status: "active",
      photos: [],
      photosToRemove: [],
    },
    validate: {
      title: (value) =>
        value && value.trim().length < 2 ? "Title must be at least 2 characters" : null,
      price: (value) =>
        value !== "" && value !== undefined && Number(value) < 0
          ? "Price must be a positive number"
          : null,
      quantityAvailable: (value) =>
        value !== "" && value !== undefined && Number(value) < 0
          ? "Quantity must be a positive number"
          : null,
    },
  });

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string }>>([]);

  useEffect(() => {
    if (listing && opened) {
      form.setValues({
        title: listing.title,
        description: listing.description || "",
        category: listing.category,
        price: listing.price ? Number(listing.price) : "",
        quantityAvailable: listing.quantityAvailable ? Number(listing.quantityAvailable) : "",
        quantityUnit: listing.quantityUnit || "",
        city: listing.city || "",
        state: listing.state || "",
        country: listing.country || "",
        shippingAvailable: listing.shippingAvailable,
        status: listing.status,
        photos: [],
        photosToRemove: [],
      });

      // Set existing images
      if (listing.images && listing.images.length > 0) {
        const images = listing.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
        }));
        setExistingImages(images);
        setPhotoPreviews(images.map((img) => img.url));
      } else {
        setExistingImages([]);
        setPhotoPreviews([]);
      }
    }
  }, [listing, opened]);

  const resetAndClose = () => {
    form.reset();
    setPhotoPreviews([]);
    setExistingImages([]);
    onClose();
  };

  const handleFileChange = (files: File[] | null) => {
    if (!files) {
      form.setFieldValue("photos", []);
      return;
    }

    const fileArray = Array.from(files);
    form.setFieldValue("photos", fileArray);

    // Create previews for new files
    const newPreviews: string[] = [];
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === fileArray.length) {
          setPhotoPreviews([...existingImages.map((img) => img.url), ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (imageId: string) => {
    const updated = existingImages.filter((img) => img.id !== imageId);
    setExistingImages(updated);
    setPhotoPreviews(photoPreviews.filter((_, index) => {
      const existingIndex = existingImages.findIndex((img) => img.id === imageId);
      return index !== existingIndex;
    }));
    form.setFieldValue("photosToRemove", [
      ...(form.values.photosToRemove || []),
      imageId,
    ]);
  };

  const removeNewPhoto = (index: number) => {
    const existingCount = existingImages.length;
    if (index >= existingCount) {
      const newIndex = index - existingCount;
      const newPhotos = form.values.photos?.filter((_, i) => i !== newIndex) || [];
      form.setFieldValue("photos", newPhotos);
      setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (values: UpdateListingValues) => {
    if (!listing) return;
    await onSubmit(values);
  };

  if (!listing) return null;

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      title="Edit Listing"
      centered
      size="lg"
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          const submitData: UpdateListingValues = {
            title: values.title?.trim(),
            description: values.description?.trim(),
            category: values.category,
            price: values.price !== "" && values.price !== undefined ? values.price : undefined,
            quantityAvailable:
              values.quantityAvailable !== "" && values.quantityAvailable !== undefined
                ? values.quantityAvailable
                : undefined,
            quantityUnit: values.quantityUnit,
            city: values.city?.trim(),
            state: values.state?.trim(),
            country: values.country?.trim(),
            shippingAvailable: values.shippingAvailable,
            status: values.status,
            photos: values.photos,
            photosToRemove: values.photosToRemove,
          };
          await handleSubmit(submitData);
        })}
      >
        <Stack gap="md">
          {/* Photo Upload */}
          <div>
            <FileInput
              label="Add More Photos"
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
                {photoPreviews.map((preview, index) => {
                  const isExisting = index < existingImages.length;
                  const imageId = isExisting ? existingImages[index].id : null;

                  return (
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
                        onClick={() => {
                          if (isExisting && imageId) {
                            removeExistingImage(imageId);
                          } else {
                            removeNewPhoto(index);
                          }
                        }}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    </div>
                  );
                })}
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
              Update Listing
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

