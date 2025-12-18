"use client";

import {
  Modal,
  Button,
  Group,
  ScrollArea,
  Stack,
  Select,
  NumberInput,
} from "@mantine/core";
import { BaseInput, BaseDateInput, BaseTextarea } from "@/components/ui";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type {
  AddHarvestValues,
  HarvestModalProps,
  HarvestRecord,
  CreateHarvestData,
} from "../types";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import {
  YIELD_UNIT_OPTIONS,
  CROP_TYPE_OPTIONS,
} from "../types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";

const BASE_VALUES: AddHarvestValues = {
  fieldId: "",
  harvestDate: "",
  yieldAmount: "",
  yieldUnit: "kg",
  cropType: "",
  notes: "",
  plantingRecordId: "",
};

const mapHarvestToValues = (harvest: HarvestRecord): AddHarvestValues => ({
  fieldId: harvest.fieldId,
  harvestDate: harvest.harvestDate,
  yieldAmount: harvest.yieldAmount,
  yieldUnit: harvest.yieldUnit,
  cropType: harvest.cropType,
  notes: harvest.notes || "",
  plantingRecordId: harvest.plantingRecordId || "",
});

const normalizeSubmitValues = (
  values: AddHarvestValues
): CreateHarvestData => {
  return {
    fieldId: values.fieldId,
    harvestDate: values.harvestDate,
    yieldAmount: values.yieldAmount === "" ? 0 : Number(values.yieldAmount),
    yieldUnit: values.yieldUnit,
    cropType: values.cropType,
    notes: values.notes?.trim() || undefined,
    plantingRecordId: values.plantingRecordId || undefined,
  };
};

export default function HarvestModal({
  mode,
  harvest,
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: HarvestModalProps) {
  const { options: fieldOptions, loading: loadingFields } =
    useActiveFieldsOptions(opened);
  const { farmId } = useAuth();

  // Fetch planting records for the selected field
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  
  const { data: plantingRecords = [], isLoading: loadingPlantings } = useQuery({
    queryKey: ["planting-records", selectedFieldId, farmId],
    queryFn: async () => {
      if (!selectedFieldId || !farmId) return [];
      const response = await api.get(`/api/v1/crops/plantings`, {
        params: {
          farmId,
          fieldId: selectedFieldId,
          limit: 100,
        },
      });
      const data = response?.data?.data ?? {};
      return data?.plantings ?? [];
    },
    enabled: !!selectedFieldId && !!farmId && opened,
  });

  const form = useForm<AddHarvestValues>({
    initialValues: BASE_VALUES,
    validateInputOnBlur: true,
    validate: {
      fieldId: (value) => (!value ? "Field is required" : null),
      harvestDate: (value) => (!value ? "Harvest date is required" : null),
      yieldAmount: (value) => {
        if (value === "" || value === null || value === undefined) {
          return "Yield amount is required";
        }
        if (Number(value) <= 0) {
          return "Yield amount must be greater than 0";
        }
        return null;
      },
      yieldUnit: (value) => (!value ? "Yield unit is required" : null),
      cropType: (value) => (!value ? "Crop type is required" : null),
    },
  });

  const title =
    mode === "create" ? "Add Harvest Record" : "Update Harvest Record";
  const submitLabel = mode === "create" ? "Add Harvest" : "Update Harvest";

  useEffect(() => {
    if (!opened) return;

    if (mode === "update" && harvest) {
      const mapped = mapHarvestToValues(harvest);
      form.setValues(mapped);
      form.resetDirty(mapped);
      setSelectedFieldId(harvest.fieldId);
      return;
    }

    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
      setSelectedFieldId("");
    }
  }, [mode, harvest, opened]);

  // Update selected field when fieldId changes
  useEffect(() => {
    if (form.values.fieldId) {
      setSelectedFieldId(form.values.fieldId);
    }
  }, [form.values.fieldId]);

  const handleSubmit = async (values: typeof form.values) => {
    const submitValues = normalizeSubmitValues(values);
    await onSubmit(submitValues);
    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
      setSelectedFieldId("");
    }
    onClose();
  };

  // Disable submit when unchanged or required fields missing
  const requiredFilled =
    !!form.values.fieldId &&
    !!form.values.harvestDate &&
    !!form.values.yieldAmount &&
    Number(form.values.yieldAmount) > 0 &&
    !!form.values.yieldUnit &&
    !!form.values.cropType;
  const submitDisabled = isSubmitting || !form.isDirty() || !requiredFilled;

  const plantingRecordOptions = [
    { value: "", label: "None (Optional)" },
    ...plantingRecords.map((record: any) => ({
      value: record.id,
      label: `${record.crop} - Planted ${new Date(record.plantingDate).toLocaleDateString()}`,
    })),
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <ScrollArea.Autosize mah={500}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Field"
              placeholder={loadingFields ? "Loading fields..." : "Select field"}
              data={fieldOptions}
              disabled={loadingFields}
              searchable
              key={form.key("fieldId")}
              {...form.getInputProps("fieldId")}
            />

            <Group grow>
              <Select
                label="Crop Type"
                placeholder="Select crop type"
                key={form.key("cropType")}
                data={CROP_TYPE_OPTIONS.filter((opt) => opt.value !== "all")}
                {...form.getInputProps("cropType")}
              />
              <BaseDateInput
                label="Harvest Date"
                placeholder="Select date"
                clearable
                value={
                  form.values.harvestDate
                   
                }
                onChange={(date) => {
                    form.setFieldValue("harvestDate", date || "");
                }}
                key={form.key("harvestDate")}
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Yield Amount"
                placeholder="0.00"
                decimalScale={2}
                min={0}
                key={form.key("yieldAmount")}
                {...form.getInputProps("yieldAmount")}
              />
              <Select
                label="Yield Unit"
                data={YIELD_UNIT_OPTIONS}
                key={form.key("yieldUnit")}
                {...form.getInputProps("yieldUnit")}
              />
            </Group>

            <Select
              label="Planting Record (Optional)"
              placeholder={loadingPlantings ? "Loading planting records..." : "Select planting record"}
              data={plantingRecordOptions}
              disabled={loadingPlantings || !selectedFieldId}
              searchable
              key={form.key("plantingRecordId")}
              {...form.getInputProps("plantingRecordId")}
            />

            <BaseTextarea
              label="Notes (Optional)"
              placeholder="Additional notes about this harvest"
              minRows={3}
              key={form.key("notes")}
              {...form.getInputProps("notes")}
            />
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={submitDisabled}
            >
              {submitLabel}
            </Button>
          </Group>
        </form>
      </ScrollArea.Autosize>
    </Modal>
  );
}

