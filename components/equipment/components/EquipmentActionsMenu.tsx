"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconTools } from "@tabler/icons-react";
import type { EquipmentRecord } from "../types";

interface EquipmentActionsMenuProps {
  equipment: EquipmentRecord;
  onOpenMaintenance: () => void;
}

export default function EquipmentActionsMenu({
  equipment,
  onOpenMaintenance,
}: EquipmentActionsMenuProps) {
  return (
    <Menu
      withinPortal
      width={200}
      position="bottom-end"
      shadow="sm"
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="More options"
        >
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconTools size={16} />}
          onClick={onOpenMaintenance}
        >
          Maintenance logs
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

