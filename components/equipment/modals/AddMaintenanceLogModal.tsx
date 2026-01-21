"use client";

import { Button, Group, Modal, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseInput, BaseDateInput, BaseSelect, BaseNumberInput, BaseTextarea } from "@/components/ui";
import type { AddMaintenanceLogValues, EquipmentRecord } from "../types";
import { MAINTENANCE_TYPE_OPTIONS } from "../types";

interface AddMaintenanceLogModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: {
    maintenanceDate: string;
    maintenanceType: string;
    description: string;
    cost?: number;
    performedBy?: string;
    nextMaintenanceDate?: string;
    notes?: string;
  }) => Promise<void>;
  equipment: EquipmentRecord | null;
  isSubmitting: boolean;
}

export default function AddMaintenanceLogModal({
  opened,
  onClose,
  onSubmit,
  equipment,
  isSubmitting,
}: AddMaintenanceLogModalProps) {
  const form = useForm<AddMaintenanceLogValues>({
    initialValues: {
      equipmentId: equipment?.id || "",
      maintenanceDate: "",
      maintenanceType: "",
      description: "",
      cost: "",
      performedBy: "",
      nextMaintenanceDate: "",
      notes: "",
    },
    validate: {
      maintenanceDate: (value) => (!value ? "Maintenance date is required" : null),
      maintenanceType: (value) => (!value ? "Maintenance type is required" : null),
      description: (value) =>
        value.trim().length < 3 ? "Description must be at least 3 characters" : null,
    },
  });

  const resetAndClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      title="Add Maintenance Log"
      centered
      size="lg"
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          await onSubmit({
            maintenanceDate: values.maintenanceDate,
            maintenanceType: values.maintenanceType,
            description: values.description.trim(),
            cost: values.cost === "" ? undefined : Number(values.cost),
            performedBy: values.performedBy || undefined,
            nextMaintenanceDate: values.nextMaintenanceDate || undefined,
            notes: values.notes || undefined,
          });
          resetAndClose();
        })}
      >
        <Stack gap="md">
          <BaseDateInput
            label="Maintenance Date"
            placeholder="Select maintenance date"
            required
            value={form.values.maintenanceDate ? new Date(form.values.maintenanceDate) : null}
            onChange={(date) => {
              if (date) {
                const dateObj = typeof date === 'string' ? new Date(date) : (date as unknown as Date);
                form.setFieldValue("maintenanceDate", dateObj.toISOString().split('T')[0]);
              } else {
                form.setFieldValue("maintenanceDate", "");
              }
            }}
          />
          <BaseSelect
            label="Maintenance Type"
            placeholder="Select type"
            data={MAINTENANCE_TYPE_OPTIONS.filter((opt) => opt.value !== "all")}
            required
            {...form.getInputProps("maintenanceType")}
          />
          <BaseTextarea
            label="Description"
            placeholder="Describe the maintenance work performed..."
            required
            rows={4}
            {...form.getInputProps("description")}
          />
          <BaseNumberInput
            label="Cost"
            placeholder="e.g. 500.00"
            min={0}
            decimalScale={2}
            value={form.values.cost === "" ? undefined : Number(form.values.cost)}
            onChange={(value) => {
              form.setFieldValue("cost", value === undefined ? "" : (value as number));
            }}
          />
          <BaseInput
            label="Performed By"
            placeholder="e.g. ABC Repair Services"
            {...form.getInputProps("performedBy")}
          />
          <BaseDateInput
            label="Next Maintenance Date"
            placeholder="Select next maintenance date"
            clearable
            value={form.values.nextMaintenanceDate ? new Date(form.values.nextMaintenanceDate) : null}
            onChange={(date) => {
              if (date) {
                const dateObj = typeof date === 'string' ? new Date(date) : (date as unknown as Date);
                form.setFieldValue("nextMaintenanceDate", dateObj.toISOString().split('T')[0]);
              } else {
                form.setFieldValue("nextMaintenanceDate", "");
              }
            }}
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
              Save Log
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

