"use client";

import { useEffect } from "react";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseInput, BaseDateInput, BaseSelect, BaseNumberInput, BaseTextarea } from "@/components/ui";
import type { UpdateMaintenanceLogValues, MaintenanceLogRecord } from "../types";
import { MAINTENANCE_TYPE_OPTIONS } from "../types";

interface UpdateMaintenanceLogModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: {
    maintenanceDate?: string;
    maintenanceType?: string;
    description?: string;
    cost?: number;
    performedBy?: string;
    nextMaintenanceDate?: string;
    notes?: string;
  }) => Promise<void>;
  maintenanceLog: MaintenanceLogRecord | null;
  isSubmitting: boolean;
}

export default function UpdateMaintenanceLogModal({
  opened,
  onClose,
  onSubmit,
  maintenanceLog,
  isSubmitting,
}: UpdateMaintenanceLogModalProps) {
  const form = useForm<UpdateMaintenanceLogValues>({
    initialValues: {
      maintenanceDate: "",
      maintenanceType: "",
      description: "",
      cost: "",
      performedBy: "",
      nextMaintenanceDate: "",
      notes: "",
    },
    validate: {
      description: (value) =>
        value && value.trim().length < 3 ? "Description must be at least 3 characters" : null,
    },
  });

  useEffect(() => {
    if (maintenanceLog && opened) {
      form.setValues({
        maintenanceDate: maintenanceLog.maintenanceDate || "",
        maintenanceType: maintenanceLog.maintenanceType || "",
        description: maintenanceLog.description || "",
        cost: maintenanceLog.cost ? Number(maintenanceLog.cost) : "",
        performedBy: maintenanceLog.performedBy || "",
        nextMaintenanceDate: maintenanceLog.nextMaintenanceDate || "",
        notes: maintenanceLog.notes || "",
      });
    }
  }, [maintenanceLog, opened]);

  const resetAndClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      title="Update Maintenance Log"
      centered
      size="lg"
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          const submitData: {
            maintenanceDate?: string;
            maintenanceType?: string;
            description?: string;
            cost?: number;
            performedBy?: string;
            nextMaintenanceDate?: string;
            notes?: string;
          } = {};

          if (values.maintenanceDate !== undefined && values.maintenanceDate !== maintenanceLog?.maintenanceDate) {
            submitData.maintenanceDate = values.maintenanceDate;
          }
          if (values.maintenanceType !== undefined && values.maintenanceType !== maintenanceLog?.maintenanceType) {
            submitData.maintenanceType = values.maintenanceType;
          }
          if (values.description !== undefined && values.description !== maintenanceLog?.description) {
            submitData.description = values.description.trim();
          }
          if (values.cost !== undefined && values.cost !== maintenanceLog?.cost) {
            submitData.cost = values.cost === "" ? undefined : Number(values.cost);
          }
          if (values.performedBy !== undefined && values.performedBy !== maintenanceLog?.performedBy) {
            submitData.performedBy = values.performedBy || undefined;
          }
          if (values.nextMaintenanceDate !== undefined && values.nextMaintenanceDate !== maintenanceLog?.nextMaintenanceDate) {
            submitData.nextMaintenanceDate = values.nextMaintenanceDate || undefined;
          }
          if (values.notes !== undefined && values.notes !== maintenanceLog?.notes) {
            submitData.notes = values.notes || undefined;
          }

          await onSubmit(submitData);
          resetAndClose();
        })}
      >
        <Stack gap="md">
          <BaseDateInput
            label="Maintenance Date"
            placeholder="Select maintenance date"
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
            {...form.getInputProps("maintenanceType")}
          />
          <BaseTextarea
            label="Description"
            placeholder="Describe the maintenance work performed..."
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
              Update Log
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

