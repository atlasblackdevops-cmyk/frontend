'use client';

import React from 'react';
import { IconBrandGoogle } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { Button, ButtonProps, Group } from '@mantine/core';

interface GoogleButtonProps extends ButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function GoogleButton({ children, onClick, ...props }: GoogleButtonProps) {
  return (
    <Button
      variant="outline"
      leftSection={<IconBrandGoogle size={18} />}
      onClick={(e) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
          void signIn('google', { callbackUrl: '/login', prompt: 'consent', max_age: 300 });
        }
      }}
      style={{
        borderColor: 'var(--mantine-color-gray-3)',
        color: 'var(--mantine-color-dark-7)',
        backgroundColor: 'white',
        '&:hover': {
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderColor: 'var(--mantine-color-gray-4)',
        },
      }}
      {...props}
    >
      <Group gap="xs" align="center" wrap="nowrap">
        {children}
      </Group>
    </Button>
  );
}
