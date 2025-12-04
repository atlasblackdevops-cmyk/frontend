"use client";

import { useState } from "react";
import {
    Modal,
    Image,
    Group,
    Button,
    Stack,
    Text,
    ActionIcon,
    Box,
    SimpleGrid,
} from "@mantine/core";
import {
    IconChevronLeft,
    IconChevronRight,
    IconX,
    IconPhoto,
} from "@tabler/icons-react";

interface HealthRecordImageViewerProps {
    opened: boolean;
    onClose: () => void;
    images: string[];
    title?: string;
}

export default function HealthRecordImageViewer({
    opened,
    onClose,
    images,
    title = "Health Record Images",
}: HealthRecordImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasImages = images && images.length > 0;
    const currentImage = hasImages ? images[currentIndex] : null;
    const totalImages = images?.length || 0;

    const handlePrevious = () => {
        if (hasImages) {
            setCurrentIndex((prev) =>
                prev > 0 ? prev - 1 : images.length - 1
            );
        }
    };

    const handleNext = () => {
        if (hasImages) {
            setCurrentIndex((prev) =>
                prev < images.length - 1 ? prev + 1 : 0
            );
        }
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
    };

    // Reset index when modal opens/closes
    const handleClose = () => {
        setCurrentIndex(0);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={title}
            size="xl"
            centered
            fullScreen={false}
        >
            {!hasImages ? (
                <Stack align="center" gap="md" p="xl">
                    <IconPhoto
                        size={64}
                        stroke={1.5}
                        color="var(--mantine-color-gray-5)"
                    />
                    <Text c="dimmed" size="sm">
                        No images available for this health record
                    </Text>
                </Stack>
            ) : (
                <Stack gap="md">
                    {/* Main Image Viewer */}
                    <Box
                        pos="relative"
                        style={{
                            aspectRatio: "16/9",
                            backgroundColor: "var(--mantine-color-gray-1)",
                            borderRadius: "var(--mantine-radius-md)",
                            overflow: "hidden",
                        }}
                    >
                        {currentImage && (
                            <Image
                                src={currentImage}
                                alt={`Health record image ${currentIndex + 1}`}
                                fit="contain"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        )}

                        {/* Navigation Buttons */}
                        {totalImages > 1 && (
                            <>
                                <ActionIcon
                                    variant="filled"
                                    size="lg"
                                    radius="xl"
                                    onClick={handlePrevious}
                                    style={{
                                        position: "absolute",
                                        left: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        zIndex: 10,
                                    }}
                                >
                                    <IconChevronLeft size={20} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="filled"
                                    size="lg"
                                    radius="xl"
                                    onClick={handleNext}
                                    style={{
                                        position: "absolute",
                                        right: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        zIndex: 10,
                                    }}
                                >
                                    <IconChevronRight size={20} />
                                </ActionIcon>
                            </>
                        )}

                        {/* Image Counter */}
                        {totalImages > 1 && (
                            <Box
                                style={{
                                    position: "absolute",
                                    bottom: 10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: "var(--mantine-radius-md)",
                                    fontSize: 12,
                                    zIndex: 10,
                                }}
                            >
                                {currentIndex + 1} / {totalImages}
                            </Box>
                        )}
                    </Box>

                    {/* Thumbnail Grid */}
                    {totalImages > 1 && (
                        <Box>
                            <Text size="sm" fw={500} mb="xs">
                                All Images ({totalImages})
                            </Text>
                            <SimpleGrid cols={5} spacing="xs">
                                {images.map((image, index) => (
                                    <Box
                                        key={index}
                                        onClick={() =>
                                            handleThumbnailClick(index)
                                        }
                                        style={{
                                            aspectRatio: "1",
                                            borderRadius:
                                                "var(--mantine-radius-sm)",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            border:
                                                currentIndex === index
                                                    ? "2px solid var(--mantine-color-blue-6)"
                                                    : "2px solid transparent",
                                            opacity:
                                                currentIndex === index
                                                    ? 1
                                                    : 0.7,
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentIndex !== index) {
                                                e.currentTarget.style.opacity =
                                                    "1";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentIndex !== index) {
                                                e.currentTarget.style.opacity =
                                                    "0.7";
                                            }
                                        }}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            fit="cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button onClick={handleClose}>Close</Button>
                    </Group>
                </Stack>
            )}
        </Modal>
    );
}
