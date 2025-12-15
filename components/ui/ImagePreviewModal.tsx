"use client";

import { Modal, Center } from "@mantine/core";

interface ImagePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  alt?: string;
}

export default function ImagePreviewModal({
  opened,
  onClose,
  imageUrl,
  title = "Image Preview",
  alt = "Image preview",
}: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size="lg"
    >
      <Center>
        <img
          src={imageUrl}
          alt={alt}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </Center>
    </Modal>
  );
}

