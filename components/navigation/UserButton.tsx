"use client";

import { useAuth } from "@/stores/use-auth-store";
import { Avatar, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { forwardRef, Fragment } from "react";
import classes from "./UserButton.module.css";

export interface UserButtonProps {
  collapsed?: boolean;
  name?: string;
  email?: string;
  avatarSrc?: string | null;
  onClick?: () => void;
  handleLogout?: () => void;
}

const MyProfile = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ collapsed, avatarSrc, name, email, ...others }: UserButtonProps, ref) => (
    <UnstyledButton ref={ref} className={classes.profileButton} {...others}>
      <Group>
        <Avatar src={avatarSrc} radius="xl" />
        {!collapsed && (
          <div className={classes.profileInfo}>
            <Text size="sm" fw={500}>
              {name}
            </Text>

            <Text c="dimmed" size="xs">
              {email}
            </Text>
          </div>
        )}

        {!collapsed && <IconChevronRight size={16} />}
      </Group>
    </UnstyledButton>
  )
);

export function UserButton({
  collapsed,
  name: propName,
  email: propEmail,
  avatarSrc: propAvatarSrc,
  handleLogout,
}: UserButtonProps) {
  const router = useRouter();
  const { userName, userEmail, userProfilePicture } = useAuth();

  // Use props if provided, otherwise fall back to store data, then to defaults
  const name = propName ?? userName ?? "";
  const email = propEmail ?? userEmail ?? "";
  const avatarSrc = propAvatarSrc ?? userProfilePicture ?? null;

  return (
    <Menu withArrow>
      <Menu.Target>
        <MyProfile
          collapsed={collapsed}
          avatarSrc={avatarSrc}
          name={name}
          email={email}
        />
      </Menu.Target>
      <Menu.Dropdown w={250}>
        {collapsed && (
          <Fragment>
            <Menu.Label>My Profile</Menu.Label>

            <Group className={classes.collapsedMenuGroup}>
              <Avatar src={avatarSrc} radius="xl" />
              <div className={classes.collapsedMenuInfo}>
                <Text
                  size="sm"
                  fw={600}
                  truncate="end"
                  className={classes.capitalizeText}
                >
                  {name}
                </Text>

                <Text c="dimmed" size="xs" truncate="end">
                  {email}
                </Text>
              </div>
            </Group>
            <Menu.Divider />
          </Fragment>
        )}
        <Menu.Item
          leftSection={<IconSettings size={18} />}
          onClick={() => router.push("/settings")}
          fw={500}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
          fw={500}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserButton;
