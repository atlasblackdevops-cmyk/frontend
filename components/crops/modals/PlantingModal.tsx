"use client";

import { useActiveFieldsOptionsPaginated } from "@/components/shared/hooks/useActiveFieldsOptionsPaginated";
import { BaseDateInput, BaseInput, BaseTextarea } from "@/components/ui";
import {
  Autocomplete,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AddPlantingValues,
  PlantingModalProps,
  PlantingRecord,
} from "../types";
import {
  AREA_UNIT_OPTIONS,
  CROP_OPTIONS,
  QUANTITY_UNIT_OPTIONS,
} from "../types";

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
  const { 
    options: fieldOptions, 
    loading: loadingFields,
    hasMore,
    loadMore,
    search: searchFields,
    searchQuery,
    addOption
  } = useActiveFieldsOptionsPaginated(opened);

  const [fieldSearchValue, setFieldSearchValue] = useState("");
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [selectedFieldLabel, setSelectedFieldLabel] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingElementRef = useRef<HTMLDivElement>(null);
  const selectingRef = useRef(false);

  const fieldLabelMap = useMemo(
    () =>
      new Map(
        fieldOptions.map((opt) => [opt.label, opt.value])
      ),
    [fieldOptions]
  );
  
  // Debounced search function
  const debouncedSearch = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchFields(value);
    }, 300); // 300ms debounce delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Use Intersection Observer to detect when loading element comes into view
  useEffect(() => {
    if (!dropdownOpened || !hasMore) return;

    let observer: IntersectionObserver | null = null;

    const dropdownContainer =
      document.querySelector('[data-combobox-dropdown]') ||
      document.querySelector(".mantine-Autocomplete-dropdown") ||
      document.querySelector('[role="listbox"]');

    if (!dropdownContainer || !loadingElementRef.current) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loadingFields) {
            loadMore();
          }
        });
      },
      {
        root: dropdownContainer,
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    observer.observe(loadingElementRef.current);

    return () => observer?.disconnect();
  }, [dropdownOpened, hasMore, loadingFields, loadMore]);

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
      
      // Ensure the selected field is in the options for display
      if (planting.fieldId && planting.fieldName) {
        addOption({
          value: planting.fieldId,
          label: planting.fieldName,
        });
        setFieldSearchValue(planting.fieldName);
        // setSelectedFieldLabel(planting.fieldName);
      }
      return;
    }

    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
      setFieldSearchValue("");
      setSelectedFieldLabel("");
    }
  }, [mode, planting, opened, addOption]);

  const handleSubmit = async (values: typeof form.values) => {
    /* ✅ FINAL SAFETY SYNC (FIX) */
    if (!values.fieldId) {
      const matched = fieldLabelMap.get(fieldSearchValue);
      if (matched) {
        values.fieldId = matched;
      }
    }

    const submitValues = normalizeSubmitValues(values);
    await onSubmit(submitValues);
    onClose();
  };

  // Disable submit when unchanged or required fields missing
  const requiredFilled =
    !!form.values.fieldId &&
    !!form.values.crop &&
    !!form.values.seedType.trim() &&
    !!form.values.plantingDate;
  const submitDisabled = isSubmitting || !form.isDirty() ;

  // Prepare data with loading indicator as last item (always show when hasMore is true)
  const autocompleteData = [
    ...fieldOptions,
    ...(hasMore
      ? [
          {
            value: "__loading__",
            label: "Loading more...",
            disabled: true,
          },
        ]
      : []),
  ];


  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <ScrollArea.Autosize mah={500}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
          <Autocomplete
              label="Field"
              placeholder="Search and select field"
              data={autocompleteData}
              value={fieldSearchValue}
              error={form.errors.fieldId}
              limit={Infinity}
              maxDropdownHeight={300}
              filter={({ options }) => options}
              onChange={(value) => {
                setFieldSearchValue(value);
              
                if (selectingRef.current) {
                  // selection just happened, don't clear label
                  selectingRef.current = false;
                  return;
                }
              
                // user is typing → clear selection
                setSelectedFieldLabel("");
                form.setFieldValue("fieldId", "");
              
                debouncedSearch(value);
              }}
              onOptionSubmit={(value) => {
                if (value === "__loading__") return;
              
                const selected = fieldOptions.find((opt) => opt.value === value);
                if (!selected) return;
              
                selectingRef.current = true;
              
                setFieldSearchValue(selected.label);
                setSelectedFieldLabel(selected.label);
                form.setFieldValue("fieldId", selected.value);
                setDropdownOpened(false);
              }}
              onDropdownOpen={() => {
                setDropdownOpened(true);
                searchFields(fieldSearchValue);
              }}
              onDropdownClose={() => {
                setDropdownOpened(false);
              
                const matched = fieldLabelMap.get(fieldSearchValue);
                if (matched) {
                  form.setFieldValue("fieldId", matched);
                  setSelectedFieldLabel(fieldSearchValue);
                } else if (selectedFieldLabel) {
                  setFieldSearchValue(selectedFieldLabel);
                }
              }}
              renderOption={(item) =>
                item.option.value === "__loading__" ? (
                  <div ref={loadingElementRef}>
                    <Group justify="center" p="xs">
                      <Loader size="sm" />
                      <Text size="sm" c="dimmed">
                        Loading more...
                      </Text>
                    </Group>
                  </div>
                ) : (
                  <span>{(item.option as any)?.label}</span>
                )
              }
            />

            <Select
              label="Crop"  
              placeholder="Select crop type"
              key={form.key("crop")}
              data={CROP_OPTIONS.filter((opt) => opt.value !== "all")}
              searchable
              limit={Infinity}
              maxDropdownHeight={300}
              {...form.getInputProps("crop")}
            />

            <BaseInput
              label="Seed Type"
              placeholder="e.g., Hybrid Corn, Organic Wheat"
              key={form.key("seedType")}
              {...form.getInputProps("seedType")}
            />

            <BaseDateInput
              label="Planting Date"
              placeholder="Select date"
              clearable
              value={form.values.plantingDate}
              onChange={(date) => {
                form.setFieldValue("plantingDate", date || "");
              }}
              key={form.key("plantingDate")}
            />

            <BaseDateInput
              label="Expected Harvest Date (Optional)"
              placeholder="Select date"
              clearable
              value={form.values.expectedHarvestDate}
              onChange={(date) => {
                form.setFieldValue("expectedHarvestDate", date || "");
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
                searchable
                limit={Infinity}
                maxDropdownHeight={300}
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
                searchable
                limit={Infinity}
                maxDropdownHeight={300}
                key={form.key("areaUnit")}
                {...form.getInputProps("areaUnit")}
              />
            </Group>

            <BaseTextarea
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