"use client";

import {
  Modal,
  Button,
  Group,
  ScrollArea,
  Stack,
  Select,
  NumberInput,
  Autocomplete,
  Loader,
  Text,
  Box,
} from "@mantine/core";
import { BaseInput, BaseDateInput, BaseTextarea } from "@/components/ui";
import { useForm } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import type {
  AddPlantingValues,
  PlantingModalProps,
  PlantingRecord,
} from "../types";
import { useActiveFieldsOptionsPaginated } from "@/components/shared/hooks/useActiveFieldsOptionsPaginated";
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

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [fieldSearchValue, setFieldSearchValue] = useState("");
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Attach scroll listener to dropdown for infinite loading
  useEffect(() => {
    if (!dropdownOpened) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const { scrollTop, scrollHeight, clientHeight } = target;
      
      // Load more when scrolled to 50% of content (more aggressive loading)
      if (scrollTop + clientHeight >= scrollHeight * 0.5 && hasMore && !loadingFields) {
        console.log('Loading more fields...', { scrollTop, scrollHeight, clientHeight });
        loadMore();
      }
    };

    // Find the dropdown element and attach scroll listener
    const timer = setTimeout(() => {
      const dropdown = 
        document.querySelector('[data-combobox-dropdown]') ||
        document.querySelector('.mantine-Autocomplete-dropdown') ||
        document.querySelector('[role="listbox"]');
      
      if (dropdown) {
        console.log('Attaching scroll listener to dropdown', dropdown);
        dropdown.addEventListener('scroll', handleScroll, { passive: true });
      } else {
        console.warn('Dropdown element not found for scroll listener');
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      const dropdown = 
        document.querySelector('[data-combobox-dropdown]') ||
        document.querySelector('.mantine-Autocomplete-dropdown') ||
        document.querySelector('[role="listbox"]');
      
      if (dropdown) {
        dropdown.removeEventListener('scroll', handleScroll);
      }
    };
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
      }
      return;
    }

    if (mode === "create") {
      form.setValues(BASE_VALUES);
      form.resetDirty(BASE_VALUES);
      setFieldSearchValue("");
    }
  }, [mode, planting, opened, addOption]);

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

  // Prepare data with loading indicator as last item
  const autocompleteData = [
    ...(Array.isArray(fieldOptions) ? fieldOptions : []),
    ...(loadingFields && hasMore ? [{
      value: '__loading__',
      label: 'Loading more fields...',
      disabled: true,
    }] : [])
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
              onChange={(value) => {
                setFieldSearchValue(value);
                debouncedSearch(value);
              }}
              onOptionSubmit={(value) => {
                // Ignore the loading indicator
                if (value === '__loading__') return;
                
                const selectedField = fieldOptions?.find((opt) => opt.value === value);
                if (selectedField) {
                  form.setFieldValue("fieldId", value);
                  setFieldSearchValue(selectedField.label);
                }
              }}
              error={form.errors.fieldId}
              maxDropdownHeight={300}
              limit={Infinity}
              filter={({ options }) => options}
              onDropdownOpen={() => {
                setDropdownOpened(true);
                console.log('Dropdown opened, fields count:', fieldOptions?.length, 'hasMore:', hasMore);
                if (!fieldSearchValue) {
                  searchFields("");
                }
              }}
              onDropdownClose={() => {
                setDropdownOpened(false);
                if (form.values.fieldId) {
                  const selectedField = fieldOptions?.find((opt) => opt.value === form.values.fieldId);
                  if (selectedField) {
                    setFieldSearchValue(selectedField.label);
                  }
                } else {
                  setFieldSearchValue("");
                }
              }}
              rightSection={loadingFields && !dropdownOpened ? <Loader size="xs" /> : undefined}
              comboboxProps={{
                dropdownPadding: 0,
                position: "bottom-start",
                middlewares: { flip: false, shift: false },
              }}
              styles={{
                dropdown: {
                  maxHeight: 300,
                  overflowY: 'auto',
                },
                option: {
                  '&[data-combobox-disabled]': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--mantine-color-dimmed)',
                    fontWeight: 500,
                    cursor: 'default',
                    opacity: 1,
                  },
                },
              }}
              renderOption={(item) => {
                if (item.option.value === '__loading__') {
                  return (
                    <Group gap="sm" justify="center" p="xs">
                      <Loader size="sm" />
                      <Text size="sm" fw={500} c="dimmed">
                        Loading more fields...
                      </Text>
                    </Group>
                  );
                }
                return <span>{item?.option?.label}</span>;
              }}
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