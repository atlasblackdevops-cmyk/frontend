"use client";

import { useState } from "react";
import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Grid,
  Pagination,
  Center,
  Loader,
  Paper,
} from "@mantine/core";
import { IconShoppingCart, IconMapPin, IconTruck, IconMail } from "@tabler/icons-react";
import type { BrowseListingRecord, BrowseGridProps } from "../types";

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

function ListingCard({ listing, onViewDetails }: { listing: BrowseListingRecord; onViewDetails: (listing: BrowseListingRecord) => void }) {
  const locationParts = [
    listing.city,
    listing.state,
    listing.country,
  ].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";
  
  // Get seller email from farm.ownerEmail
  const sellerEmail = listing.farm?.ownerEmail;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Card.Section>
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            height={200}
            alt={listing.title}
            fit="cover"
          />
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
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg" lineClamp={2} style={{ flex: 1 }}>
            {listing.title}
          </Text>
          <Badge variant="light" color="blue">
            {getCategoryLabel(listing.category)}
          </Badge>
        </Group>

        <Text size="xl" fw={700} c="blue">
          {formatCurrency(listing.price)}
        </Text>

        <Group gap="xs" c="dimmed">
          <IconMapPin size={16} />
          <Text size="sm" lineClamp={1}>
            {location}
          </Text>
        </Group>

        {listing.shippingAvailable && (
          <Group gap="xs" c="green">
            <IconTruck size={16} />
            <Text size="sm">Shipping Available</Text>
          </Group>
        )}

        <Group gap="xs" mt="xs">
          <Text size="sm" c="dimmed">
            {listing.farm.farmName}
          </Text>
        </Group>

        <Group gap="sm" mt="md">
          <Button
            variant="light"
            color="blue"
            style={{ flex: 1 }}
            radius="md"
            onClick={() => onViewDetails(listing)}
          >
            View Details
          </Button>
          {sellerEmail && (
            <Button
              variant="filled"
              color="green"
              leftSection={<IconMail size={16} />}
              style={{ flex: 1 }}
              radius="md"
              component="a"
              href={`mailto:${sellerEmail}?subject=${encodeURIComponent(`Inquiry about ${listing.title}`)}&body=${encodeURIComponent(`Hello,\n\nI am interested in your listing: ${listing.title}\n\nPlease contact me regarding this item.\n\nThank you!`)}`}
            >
              Contact
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

export default function BrowseGrid({
  listings,
  pagination,
  isLoading,
  onViewDetails,
  onPageChange,
}: BrowseGridProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (listings.length === 0) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="md">
          <IconShoppingCart size={64} color="var(--mantine-color-gray-5)" />
          <div style={{ textAlign: "center" }}>
            <Text fw={600} size="lg" mb="xs">
              No Listings Found
            </Text>
            <Text c="dimmed" size="sm">
              Try adjusting your filters to see more listings.
            </Text>
          </div>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      <Grid>
        {listings.map((listing) => (
          <Grid.Col key={listing.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <ListingCard listing={listing} onViewDetails={onViewDetails} />
          </Grid.Col>
        ))}
      </Grid>

      {pagination.totalPages > 1 && (
        <Center>
          <Pagination
            total={pagination.totalPages}
            value={pagination.page}
            onChange={(page) => onPageChange?.(page)}
            size="md"
            radius="md"
          />
        </Center>
      )}
    </Stack>
  );
}

