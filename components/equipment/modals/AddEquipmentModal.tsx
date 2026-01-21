"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  FileInput,
  Group,
  Modal,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { BaseInput, BaseDateInput, BaseSelect, BaseNumberInput, BaseTextarea } from "@/components/ui";
import type { AddEquipmentValues } from "../types";
import { EQUIPMENT_STATUS_OPTIONS, EQUIPMENT_TYPE_OPTIONS } from "../types";

interface AddEquipmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: AddEquipmentValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddEquipmentModal({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: AddEquipmentModalProps) {
  const form = useForm<AddEquipmentValues>({
    initialValues: {
      equipmentName: "",
      equipmentType: "",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchaseCost: "",
      status: "operational",
      notes: "",
      photo: null,
    },
    validate: {
      equipmentName: (value) =>
        value.trim().length < 2 ? "Equipment name must be at least 2 characters" : null,
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
      title="Add Equipment"
      centered
      size="lg"
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          await onSubmit({
            equipmentName: values.equipmentName.trim(),
            equipmentType: values.equipmentType,
            brand: values.brand,
            model: values.model,
            serialNumber: values.serialNumber,
            purchaseDate: values.purchaseDate,
            purchaseCost: values.purchaseCost,
            status: values.status,
            notes: values.notes,
            photo: values.photo,
          });
        })}
      >
        <Stack gap="md">
          <Group align="center" gap="md">
            <Avatar src={photoPreview} size={72} radius="md" variant="light">
              {!photoPreview &&
                (form.values.equipmentName?.[0]?.toUpperCase() || (
                  <IconPhoto size={32} />
                ))}
            </Avatar>
            <FileInput
              placeholder="Upload equipment photo"
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
            label="Equipment Name"
            placeholder="e.g. John Deere Tractor"
            required
            {...form.getInputProps("equipmentName")}
          />
          <BaseSelect
            label="Equipment Type"
            placeholder="Select type"
            data={EQUIPMENT_TYPE_OPTIONS.filter((opt) => opt.value !== "all")}
            {...form.getInputProps("equipmentType")}
          />
          <BaseInput
            label="Brand"
            placeholder="e.g. John Deere"
            {...form.getInputProps("brand")}
          />
          <BaseInput
            label="Model"
            placeholder="e.g. 9R 370"
            {...form.getInputProps("model")}
          />
          <BaseInput
            label="Serial Number"
            placeholder="e.g. JD123456789"
            {...form.getInputProps("serialNumber")}
          />
          <BaseDateInput
            label="Purchase Date"
            placeholder="Select purchase date"
            clearable
            value={form.values.purchaseDate ? new Date(form.values.purchaseDate) : null}
            onChange={(date) => {
              if (date) {
                const dateObj = typeof date === 'string' ? new Date(date) : (date as unknown as Date);
                form.setFieldValue("purchaseDate", dateObj.toISOString().split('T')[0]);
              } else {
                form.setFieldValue("purchaseDate", "");
              }
            }}
          />
          <BaseNumberInput
            label="Purchase Cost"
            placeholder="e.g. 150000"
            min={0}
            decimalScale={2}
            value={form.values.purchaseCost === "" ? undefined : Number(form.values.purchaseCost)}
            onChange={(value) => {
              form.setFieldValue("purchaseCost", value === undefined ? "" : (value as number));
            }}
          />
          <BaseSelect
            label="Status"
            placeholder="Select status"
            data={EQUIPMENT_STATUS_OPTIONS.filter((opt) => opt.value !== "all")}
            {...form.getInputProps("status")}
          />
          <BaseTextarea
            label="Notes"
            placeholder="Additional notes..."
            rows={3}
            {...form.getInputProps("notes")}
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
              Save Equipment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

