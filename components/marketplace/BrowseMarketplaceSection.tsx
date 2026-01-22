"use client";

import { useState, useEffect } from "react";
import {
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type {
  BrowseFilterValues,
} from "./types";
import { useBrowseMarketplace } from "./hooks";
import { ListingDetailModal } from "./modals";
import { BrowseFiltersDrawer } from "./drawers";
import { BrowseGrid, ListingFilters } from "./components";

export default function BrowseMarketplaceSection() {
  const { permissions, role } = useAuth();

  // Permission check - browse requires MARKETPLACE:LISTING permission
  const canBrowse =
    hasPermission("MARKETPLACE", "LISTING", permissions, role) ||
    hasPermission("MARKETPLACE", "READ", permissions, role);

  const {
    listings: browseListings,
    isLoading: browseLoading,
    pagination: browsePagination,
    error: browseError,
    fetchBrowseListings,
    setPagination: setBrowsePagination,
  } = useBrowseMarketplace();

  // Modal/Drawer states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBrowseListingId, setSelectedBrowseListingId] = useState<string | null>(null);
  const [browseFiltersDrawerOpen, setBrowseFiltersDrawerOpen] = useState(false);
  const { Toast, showToast } = useToast();

  // Filter form
  const browseFilterForm = useForm<BrowseFilterValues>({
    initialValues: {
      search: "",
      category: "all",
      city: "",
      state: "",
      country: "",
      maxDistance: "",
      latitude: "",
      longitude: "",
    },
  });

  // Load browse listings on mount only if user has permission
  useEffect(() => {
    if (canBrowse) {
      fetchBrowseListings(1);
    }
  }, [canBrowse]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (browseError) {
      showToast(browseError, "red");
    }
  }, [browseError]);

  // Calculate active filters count
  const getBrowseActiveFiltersCount = () => {
    let count = 0;
    if (browseFilterForm.values.category !== "all") count++;
    if (browseFilterForm.values.city) count++;
    if (browseFilterForm.values.state) count++;
    if (browseFilterForm.values.country) count++;
    if (browseFilterForm.values.maxDistance) count++;
    if (browseFilterForm.values.latitude && browseFilterForm.values.longitude) count++;
    return count;
  };

  // Handle search change
  const handleBrowseSearchChange = (searchValue: string) => {
    browseFilterForm.setFieldValue("search", searchValue);
    fetchBrowseListings(1, {
      search: searchValue,
      category: browseFilterForm.values.category !== "all" ? browseFilterForm.values.category : undefined,
      city: browseFilterForm.values.city || undefined,
      state: browseFilterForm.values.state || undefined,
      country: browseFilterForm.values.country || undefined,
      maxDistance: browseFilterForm.values.maxDistance ? Number(browseFilterForm.values.maxDistance) : undefined,
      latitude: browseFilterForm.values.latitude ? Number(browseFilterForm.values.latitude) : undefined,
      longitude: browseFilterForm.values.longitude ? Number(browseFilterForm.values.longitude) : undefined,
    });
  };

  // Handle filters
  const handleApplyBrowseFilters = (filters: BrowseFilterValues) => {
    browseFilterForm.setValues(filters);
    fetchBrowseListings(1, {
      search: filters.search,
      category: filters.category !== "all" ? filters.category : undefined,
      city: filters.city || undefined,
      state: filters.state || undefined,
      country: filters.country || undefined,
      maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined,
      latitude: filters.latitude ? Number(filters.latitude) : undefined,
      longitude: filters.longitude ? Number(filters.longitude) : undefined,
    });
  };

  const handleClearBrowseFilters = () => {
    browseFilterForm.setValues({
      search: "",
      category: "all",
      city: "",
      state: "",
      country: "",
      maxDistance: "",
      latitude: "",
      longitude: "",
    });
    fetchBrowseListings(1);
  };

  // Handle view details
  const handleViewBrowseDetails = (listing: any) => {
    setSelectedBrowseListingId(listing.id);
    setDetailModalOpen(true);
  };

  // Show permission denied message if user doesn't have access
  if (!canBrowse) {
    return (
      <>
        <Toast />
        <Paper
          p={26}
          radius="none"
          withBorder={false}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Stack gap="lg">
            <div>
              <Title order={2}>Browse Marketplace</Title>
              <Text c="dimmed" size="sm">
                Discover listings from other farms
              </Text>
            </div>
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Access Denied"
              color="red"
            >
              You do not have permission to browse marketplace listings. Please contact your administrator.
            </Alert>
          </Stack>
        </Paper>
      </>
    );
  }

  return (
    <>
      <Toast />
      <Paper
        p={26}
        radius="none"
        withBorder={false}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
          {/* Header */}
          <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
            <div>
              <Title order={2}>Browse Marketplace</Title>
              <Text c="dimmed" size="sm">
                Discover listings from other farms
              </Text>
            </div>
          </Group>

          {/* Search and Filters */}
          <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
            <BaseInput
              placeholder="Search marketplace..."
              leftSection={<IconSearch size={16} />}
              style={{
                width: "100%",
                maxWidth: 500,
                flex: "1 1 0",
                minWidth: 0,
              }}
              styles={{
                input: {
                  height: "42px",
                  minHeight: "42px",
                },
              }}
              value={browseFilterForm.values.search}
              onChange={(e) => {
                handleBrowseSearchChange(e.currentTarget.value);
              }}
            />
            <ListingFilters
              onOpenFilters={() => setBrowseFiltersDrawerOpen(true)}
              activeFiltersCount={getBrowseActiveFiltersCount()}
            />
          </Group>

          {/* Grid */}
          <div
            style={{
              flex: "1 1 0",
              minHeight: 0,
              width: "100%",
              overflow: "visible",
            }}
          >
            <BrowseGrid
              listings={browseListings}
              pagination={browsePagination}
              isLoading={browseLoading}
              onViewDetails={handleViewBrowseDetails}
              onPageChange={(page) => {
                setBrowsePagination({ ...browsePagination, page });
                fetchBrowseListings(page, {
                  search: browseFilterForm.values.search,
                  category: browseFilterForm.values.category !== "all" ? browseFilterForm.values.category : undefined,
                  city: browseFilterForm.values.city || undefined,
                  state: browseFilterForm.values.state || undefined,
                  country: browseFilterForm.values.country || undefined,
                  maxDistance: browseFilterForm.values.maxDistance ? Number(browseFilterForm.values.maxDistance) : undefined,
                  latitude: browseFilterForm.values.latitude ? Number(browseFilterForm.values.latitude) : undefined,
                  longitude: browseFilterForm.values.longitude ? Number(browseFilterForm.values.longitude) : undefined,
                });
              }}
            />
          </div>
        </Stack>
      </Paper>

      {/* Modals */}
      <ListingDetailModal
        opened={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedBrowseListingId(null);
        }}
        listingId={selectedBrowseListingId}
      />

      {/* Drawers */}
      <BrowseFiltersDrawer
        opened={browseFiltersDrawerOpen}
        onClose={() => setBrowseFiltersDrawerOpen(false)}
        filters={browseFilterForm.values}
        onApplyFilters={handleApplyBrowseFilters}
        onClearFilters={handleClearBrowseFilters}
      />
    </>
  );
}

