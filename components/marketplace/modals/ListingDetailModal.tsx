"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Image,
  SimpleGrid,
  Paper,
  Divider,
} from "@mantine/core";
import { IconMapPin, IconTruck, IconShoppingCart } from "@tabler/icons-react";
import type { ListingDetailModalProps, ListingRecord } from "../types";
import { useBrowseMarketplace } from "../hooks/useBrowseMarketplace";

function formatCurrency(amount: string | null | undefined): string {
  if (!amount) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount));
  } catch {
    return amount;
  }
}

function getCategoryLabel(category: string): string {
  switch (category?.toLowerCase()) {
    case "produce":
      return "Produce";
    case "livestock":
      return "Livestock";
    case "equipment":
      return "Equipment";
    case "seeds":
      return "Seeds";
    case "fertilizer":
      return "Fertilizer";
    case "other":
      return "Other";
    default:
      return category;
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "sold":
      return "Sold";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

export default function ListingDetailModal({
  opened,
  onClose,
  listingId,
}: ListingDetailModalProps) {
  const { fetchListingDetails, isLoading } = useBrowseMarketplace();
  const [listing, setListing] = useState<ListingRecord | null>(null);

  useEffect(() => {
    if (opened && listingId) {
      fetchListingDetails(listingId).then((data) => {
        setListing(data);
      });
    } else {
      setListing(null);
    }
  }, [opened, listingId]);

  if (!listing && !isLoading) {
    return (
      <Modal opened={opened} onClose={onClose} title="Listing Details" size="lg" centered>
        <Text c="dimmed">Listing not found</Text>
      </Modal>
    );
  }

  const locationParts = [
    listing?.city,
    listing?.state,
    listing?.country,
  ].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Listing Details"
      size="lg"
      centered
    >
      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : listing ? (
        <Stack gap="md">
          {/* Images */}
          {listing.images && listing.images.length > 0 ? (
            <SimpleGrid cols={listing.images.length > 1 ? 2 : 1}>
              {listing.images.map((image, index) => (
                <Image
                  key={image.id}
                  src={image.imageUrl}
                  alt={`${listing.title} - Image ${index + 1}`}
                  radius="md"
                  h={200}
                  fit="cover"
                />
              ))}
            </SimpleGrid>
          ) : (
            <Paper
              h={200}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--mantine-color-gray-1)",
              }}
            >
              <IconShoppingCart size={48} color="var(--mantine-color-gray-5)" />
            </Paper>
          )}

          <Divider />

          {/* Title and Category */}
          <Group justify="space-between" align="flex-start">
            <Text fw={700} size="xl">
              {listing.title}
            </Text>
            <Badge variant="light" color="blue" size="lg">
              {getCategoryLabel(listing.category)}
            </Badge>
          </Group>

          {/* Description */}
          {listing.description && (
            <div>
              <Text fw={600} mb="xs">
                Description
              </Text>
              <Text 
                c="dimmed" 
                style={{ 
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap"
                }}
              >
                {listing.description}
              </Text>
            </div>
          )}

          {/* Farm Info */}
          {listing.farm && (
            <div>
              <Text fw={600} size="sm" c="dimmed" mb={4}>
                Farm
              </Text>
              <Text>{listing.farm.farmName}</Text>
            </div>
          )}

          <Divider />

          {/* Quantity, Status, and Shipping in one row */}
          <SimpleGrid cols={3} spacing="md">
            <div>
              <Text fw={600} size="sm" c="dimmed" mb={4}>
                Quantity Available
              </Text>
              <Text>
                {listing.quantityAvailable} {listing.quantityUnit || "units"}
              </Text>
            </div>
            <div>
              <Text fw={600} size="sm" c="dimmed" mb={4}>
                Status
              </Text>
              <Badge color={listing.status === "active" ? "green" : "gray"}>
                {getStatusLabel(listing.status)}
              </Badge>
            </div>
            <div>
              <Text fw={600} size="sm" c="dimmed" mb={4}>
                Shipping
              </Text>
              {listing.shippingAvailable ? (
                <Group gap="xs" c="green">
                  <IconTruck size={16} />
                  <Text size="sm">Available</Text>
                </Group>
              ) : (
                <Text size="sm" c="dimmed">Not Available</Text>
              )}
            </div>
          </SimpleGrid>

          {/* Location */}
          <div>
            <Text fw={600} size="sm" c="dimmed" mb={4}>
              Location
            </Text>
            <Group gap="xs" c="dimmed">
              <IconMapPin size={16} />
              <Text>{location}</Text>
            </Group>
          </div>
        </Stack>
      ) : null}
    </Modal>
  );
}

