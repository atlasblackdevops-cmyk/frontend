"use client";

import {
  Modal,
  Button,
  Group,
  ScrollArea,
  Stack,
  Select,
  TextInput,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useEffect, useMemo } from "react";
import type {
  AddPlantingValues,
  PlantingModalProps,
  PlantingRecord,
} from "../types";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import {
  AREA_UNIT_OPTIONS,
  CROP_OPTIONS,
  QUANTITY_UNIT_OPTIONS,
} from "../types";
import "@mantine/dates/styles.css";

const BASE_VALUES: AddPlantingValues = {
  fieldId: "",
  crop: "",
  seedType: "",
  plantingDate: "",
  expectedHarvestDate: "",
  quantityPlanted: "",
  quantityUnit: "kg",
  seedCost: "",
  area: "",
  areaUnit: "acres",
  notes: "",
};

const mapPlantingToValues = (planting: PlantingRecord): AddPlantingValues => ({
  fieldId: planting.fieldId,
  crop: planting.crop,
  seedType: planting.seedType,
  plantingDate: planting.plantingDate,
  expectedHarvestDate: planting.expectedHarvestDate || "",
  quantityPlanted: planting.quantityPlanted ?? "",
  quantityUnit: planting.quantityUnit ?? "kg",
  seedCost: planting.seedCost ?? "",
  area: planting.area ?? "",
  areaUnit: planting.areaUnit ?? "acres",
  notes: planting.notes ?? "",
});

const normalizeSubmitValues = (
  values: AddPlantingValues
): AddPlantingValues => ({
  fieldId: values.fieldId,
  crop: values.crop,
  seedType: values.seedType.trim(),
  plantingDate: values.plantingDate,
  expectedHarvestDate: values.expectedHarvestDate || undefined,
  quantityPlanted:
    values.quantityPlanted === "" ? undefined : values.quantityPlanted,
  quantityUnit: values.quantityUnit || undefined,
  seedCost: values.seedCost === "" ? undefined : values.seedCost,
  area: values.area === "" ? undefined : values.area,
  areaUnit: values.areaUnit || undefined,
  notes: values.notes?.trim() || undefined,
});

export default function PlantingModal({
  mode,
  planting,
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: PlantingModalProps) {
  const { options: fieldOptions, loading: loadingFields } =
    useActiveFieldsOptions(opened);

  const form = useForm<AddPlantingValues>({
    initialValues: BASE_VALUES,
    validateInputOnBlur: true,
    validate: {
      fieldId: (value) => (!value ? "Field is required" : null),
      crop: (value) => (!value ? "Crop is required" : null),
      seedType: (value) =>
        value.trim().length === 0 ? "Seed type is required" : null,
      plantingDate: (value) => (!value ? "Planting date is required" : null),
      quantityUnit: (value) => (!value ? "Quantity Unit is required" : null),
      areaUnit: (value) => (!value ? "Area Unit is required" : null),
    },
  });

  const title =
    mode === "create" ? "Add Planting Record" : "Update Planting Record";
  const submitLabel = mode === "create" ? "Add Planting" : "Update Planting";

  useEffect(() => {
    if (!opened) return;

    if (mode === "update" && planting) {
      const mapped = mapPlantingToValues(planting);
      form.setValues(mapped);
      form.resetDirty(mapped);
      return;
    }

    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
    }
  }, [mode, planting, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    const submitValues = normalizeSubmitValues(values);
    await onSubmit(submitValues);
    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
    }
    onClose();
  };

  // Disable submit when unchanged or required fields missing
  const requiredFilled =
    !!form.values.fieldId &&
    !!form.values.crop &&
    !!form.values.seedType.trim() &&
    !!form.values.plantingDate;
  const submitDisabled = isSubmitting || !form.isDirty() || !requiredFilled;

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

            <Select
              label="Crop"
              placeholder="Select crop type"
              key={form.key("crop")}
              data={CROP_OPTIONS.filter((opt) => opt.value !== "all")}
              {...form.getInputProps("crop")}
            />

            <TextInput
              label="Seed Type"
              placeholder="e.g., Hybrid Corn, Organic Wheat"
              key={form.key("seedType")}
              {...form.getInputProps("seedType")}
            />

            <DateInput
              label="Planting Date"
              placeholder="DD/MM/YYYY"
              valueFormat="DD/MM/YYYY"
              clearable
              value={
                form.values.plantingDate
                  ? new Date(form.values.plantingDate)
                  : null
              }
              key={form.key("plantingDate")}
              {...form.getInputProps("plantingDate")}
            />

            <DateInput
              label="Expected Harvest Date (Optional)"
              placeholder="DD/MM/YYYY"
              valueFormat="DD/MM/YYYY"
              clearable
              value={
                form.values.expectedHarvestDate
                  ? new Date(form.values.expectedHarvestDate)
                  : null
              }
              onChange={(value) => {
                const d = value ? new Date(value as string) : null;
                form.setFieldValue(
                  "expectedHarvestDate",
                  d ? d.toISOString().split("T")[0] : ""
                );
              }}
              key={form.key("expectedHarvestDate")}
            />

            <Group grow>
              <NumberInput
                label="Quantity Planted (Optional)"
                placeholder="0.00"
                decimalScale={2}
                min={0}
                key={form.key("quantityPlanted")}
                {...form.getInputProps("quantityPlanted")}
              />
              <Select
                label="Quantity Unit"
                data={QUANTITY_UNIT_OPTIONS}
                key={form.key("quantityUnit")}
                {...form.getInputProps("quantityUnit")}
              />
            </Group>

            <NumberInput
              label="Seed Cost (Optional)"
              placeholder="0.00"
              decimalScale={2}
              min={0}
              prefix="$"
              key={form.key("seedCost")}
              {...form.getInputProps("seedCost")}
            />

            <Group grow>
              <NumberInput
                label="Area (Optional)"
                placeholder="0.00"
                decimalScale={2}
                min={0}
                key={form.key("area")}
                {...form.getInputProps("area")}
              />
              <Select
                label="Area Unit"
                data={AREA_UNIT_OPTIONS}
                key={form.key("areaUnit")}
                {...form.getInputProps("areaUnit")}
              />
            </Group>

            <Textarea
              label="Notes (Optional)"
              placeholder="Additional notes about this planting"
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
