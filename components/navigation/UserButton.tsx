'use client';

import React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';

export interface UserButtonProps {
  name?: string;
  email?: string;
  avatarSrc?: string;
  onClick?: () => void;
}

export function UserButton({
  name = 'Test',
  email = 'Test@gmail.com',
  avatarSrc = 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png',
  onClick,
}: UserButtonProps) {
  return (
    <UnstyledButton className={classes.user} onClick={onClick}>
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <Avatar src={avatarSrc} radius="xl" />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {name}
            </Text>
            <Text c="dimmed" size="xs">
              {email}
            </Text>
          </div>
        </Group>
        <IconChevronRight size={14} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}

export default UserButton;
