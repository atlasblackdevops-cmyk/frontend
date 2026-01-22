"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tabs,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type {
  ListingRecord,
  ListingFilterValues,
  BrowseFilterValues,
  CreateListingValues,
  UpdateListingValues,
} from "./types";
import { useListings, useBrowseMarketplace } from "./hooks";
import { CreateListingModal, EditListingModal, ListingDetailModal } from "./modals";
import { ListingFiltersDrawer, BrowseFiltersDrawer } from "./drawers";
import { ListingsTable, BrowseGrid, ListingFilters } from "./components";

export default function MarketplaceSection() {
  const { farmId, permissions, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("my-listings");

  // Permission checks
  const canList =
    hasPermission("MARKETPLACE", "LISTING", permissions, role) ||
    hasPermission("MARKETPLACE", "READ", permissions, role);
  const canCreate = hasPermission("MARKETPLACE", "CREATE", permissions, role);
  const canUpdate = hasPermission("MARKETPLACE", "UPDATE", permissions, role);
  const canDelete = hasPermission("MARKETPLACE", "DELETE", permissions, role);

  // Hooks
  const {
    listings,
    isLoading: listingsLoading,
    pagination: listingsPagination,
    error: listingsError,
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
    setPagination: setListingsPagination,
  } = useListings();

  const {
    listings: browseListings,
    isLoading: browseLoading,
    pagination: browsePagination,
    error: browseError,
    fetchBrowseListings,
    setPagination: setBrowsePagination,
  } = useBrowseMarketplace();

  // Modal/Drawer states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingRecord | null>(null);
  const [selectedBrowseListingId, setSelectedBrowseListingId] = useState<string | null>(null);
  const [listingToDelete, setListingToDelete] = useState<ListingRecord | null>(null);
  const [listingsFiltersDrawerOpen, setListingsFiltersDrawerOpen] = useState(false);
  const [browseFiltersDrawerOpen, setBrowseFiltersDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { Toast, showToast } = useToast();

  // Filter forms
  const listingsFilterForm = useForm<ListingFilterValues>({
    initialValues: {
      search: "",
      category: "all",
      status: "all",
      city: "",
      state: "",
      country: "",
    },
  });

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

  // Load listings on mount and when farmId changes
  useEffect(() => {
    if (farmId && canList && activeTab === "my-listings") {
      fetchListings(1);
    }
  }, [farmId, canList, activeTab]);

  // Load browse listings when browse tab is active
  useEffect(() => {
    if (activeTab === "browse") {
      fetchBrowseListings(1);
    }
  }, [activeTab]);

  // Surface fetch errors as toast
  useEffect(() => {
    if (listingsError) {
      showToast(listingsError, "red");
    }
  }, [listingsError]);

  useEffect(() => {
    if (browseError) {
      showToast(browseError, "red");
    }
  }, [browseError]);

  // Calculate active filters count
  const getListingsActiveFiltersCount = () => {
    let count = 0;
    if (listingsFilterForm.values.category !== "all") count++;
    if (listingsFilterForm.values.status !== "all") count++;
    if (listingsFilterForm.values.city) count++;
    if (listingsFilterForm.values.state) count++;
    if (listingsFilterForm.values.country) count++;
    return count;
  };

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
  const handleListingsSearchChange = (searchValue: string) => {
    listingsFilterForm.setFieldValue("search", searchValue);
    fetchListings(1, {
      search: searchValue,
      category: listingsFilterForm.values.category !== "all" ? listingsFilterForm.values.category : undefined,
      status: listingsFilterForm.values.status !== "all" ? listingsFilterForm.values.status : undefined,
      city: listingsFilterForm.values.city || undefined,
      state: listingsFilterForm.values.state || undefined,
      country: listingsFilterForm.values.country || undefined,
    });
  };

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
  const handleApplyListingsFilters = (filters: ListingFilterValues) => {
    listingsFilterForm.setValues(filters);
    fetchListings(1, {
      search: filters.search,
      category: filters.category !== "all" ? filters.category : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      city: filters.city || undefined,
      state: filters.state || undefined,
      country: filters.country || undefined,
    });
  };

  const handleClearListingsFilters = () => {
    listingsFilterForm.setValues({
      search: "",
      category: "all",
      status: "all",
      city: "",
      state: "",
      country: "",
    });
    fetchListings(1);
  };

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

  // Handle CRUD operations
  const handleCreateListing = async (values: CreateListingValues) => {
    setIsSubmitting(true);
    try {
      const result = await createListing({
        title: values.title,
        description: values.description,
        category: values.category,
        price: Number(values.price),
        quantityAvailable: Number(values.quantityAvailable),
        quantityUnit: values.quantityUnit,
        city: values.city,
        state: values.state,
        country: values.country,
        shippingAvailable: values.shippingAvailable,
        status: values.status,
        photos: values.photos,
      });

      if (result.success) {
        showToast("Listing created successfully", "green");
        setCreateModalOpen(false);
        fetchListings(listingsPagination.page);
      } else {
        showToast(result.error || "Failed to create listing", "red");
        throw new Error(result.error || "Failed to create listing");
      }
    } catch (error: any) {
      showToast(error?.message || "Failed to create listing", "red");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateListing = async (values: UpdateListingValues) => {
    if (!selectedListing) return;

    setIsUpdating(true);
    try {
      // Convert form values to API format
      const submitData: any = {
        title: values.title?.trim(),
        description: values.description?.trim() || undefined,
        category: values.category,
        price: values.price !== "" && values.price !== undefined ? Number(values.price) : undefined,
        quantityAvailable:
          values.quantityAvailable !== "" && values.quantityAvailable !== undefined
            ? Number(values.quantityAvailable)
            : undefined,
        quantityUnit: values.quantityUnit || undefined,
        city: values.city?.trim() || undefined,
        state: values.state?.trim() || undefined,
        country: values.country?.trim() || undefined,
        shippingAvailable: values.shippingAvailable,
        status: values.status,
        photos: values.photos,
        photosToRemove: values.photosToRemove,
      };

      // Remove undefined values
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const result = await updateListing(selectedListing.id, submitData);

      if (result.success) {
        showToast("Listing updated successfully", "green");
        setEditModalOpen(false);
        setSelectedListing(null);
        fetchListings(listingsPagination.page);
      } else {
        showToast(result.error || "Failed to update listing", "red");
        throw new Error(result.error || "Failed to update listing");
      }
    } catch (error: any) {
      showToast(error?.message || "Failed to update listing", "red");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteListing(listingToDelete.id);

      if (result.success) {
        showToast("Listing deleted successfully", "green");
        setDeleteModalOpen(false);
        setListingToDelete(null);
        fetchListings(listingsPagination.page);
      } else {
        showToast(result.error || "Failed to delete listing", "red");
      }
    } catch (error: any) {
      showToast(error?.message || "Failed to delete listing", "red");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewBrowseDetails = (listing: any) => {
    setSelectedBrowseListingId(listing.id);
    setDetailModalOpen(true);
  };

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
              <Title order={2}>Marketplace</Title>
              <Text c="dimmed" size="sm">
                Manage your listings and browse the marketplace
              </Text>
            </div>
            {canCreate && activeTab === "my-listings" && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateModalOpen(true)}
              >
                Create Listing
              </Button>
            )}
          </Group>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="my-listings" leftSection={<IconShoppingCart size={16} />}>
                My Listings
              </Tabs.Tab>
              <Tabs.Tab value="browse" leftSection={<IconSearch size={16} />}>
                Browse Marketplace
              </Tabs.Tab>
            </Tabs.List>

            {/* My Listings Tab */}
            <Tabs.Panel value="my-listings" pt="lg">
              <Stack gap="md" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                {/* Search and Filters */}
                <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <BaseInput
                    placeholder="Search listings..."
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
                    value={listingsFilterForm.values.search}
                    onChange={(e) => {
                      handleListingsSearchChange(e.currentTarget.value);
                    }}
                  />
                  <ListingFilters
                    onOpenFilters={() => setListingsFiltersDrawerOpen(true)}
                    activeFiltersCount={getListingsActiveFiltersCount()}
                  />
                </Group>

                {/* Table */}
                <div
                  style={{
                    flex: "1 1 0",
                    minHeight: 0,
                    width: "100%",
                    maxHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <ListingsTable
                    listings={listings}
                    pagination={listingsPagination}
                    isLoading={listingsLoading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={(listing) => {
                      setSelectedListing(listing);
                      setEditModalOpen(true);
                    }}
                    onDelete={(listing) => {
                      setListingToDelete(listing);
                      setDeleteModalOpen(true);
                    }}
                    onPageChange={(page) => {
                      setListingsPagination({ ...listingsPagination, page });
                      fetchListings(page, {
                        search: listingsFilterForm.values.search,
                        category: listingsFilterForm.values.category !== "all" ? listingsFilterForm.values.category : undefined,
                        status: listingsFilterForm.values.status !== "all" ? listingsFilterForm.values.status : undefined,
                        city: listingsFilterForm.values.city || undefined,
                        state: listingsFilterForm.values.state || undefined,
                        country: listingsFilterForm.values.country || undefined,
                      });
                    }}
                  />
                </div>
              </Stack>
            </Tabs.Panel>

            {/* Browse Tab */}
            <Tabs.Panel value="browse" pt="lg">
              <Stack gap="md" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
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
                    maxHeight: "100%",
                    overflow: "auto",
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
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>

      {/* Modals */}
      <CreateListingModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateListing}
        isSubmitting={isSubmitting}
      />

      <EditListingModal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        onSubmit={handleUpdateListing}
        isSubmitting={isUpdating}
      />

      <ListingDetailModal
        opened={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedBrowseListingId(null);
        }}
        listingId={selectedBrowseListingId}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setListingToDelete(null);
        }}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message={`Are you sure you want to delete "${listingToDelete?.title}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      {/* Drawers */}
      <ListingFiltersDrawer
        opened={listingsFiltersDrawerOpen}
        onClose={() => setListingsFiltersDrawerOpen(false)}
        filters={listingsFilterForm.values}
        onApplyFilters={handleApplyListingsFilters}
        onClearFilters={handleClearListingsFilters}
      />

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

