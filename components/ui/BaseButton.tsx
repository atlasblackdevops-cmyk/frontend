'use client';

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@mantine/core';

export type BaseButtonIntent = 'primary' | 'secondary';

export interface BaseButtonProps extends ButtonProps {
  intent?: BaseButtonIntent;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    { intent = 'primary', color, radius = 'md', size = 'md', variant = 'filled', ...props },
    ref
  ) => {
    const resolvedColor = color ?? (intent === 'secondary' ? 'brandOrange' : 'brandGreen');
    return (
      <Button
        ref={ref}
        color={resolvedColor}
        radius={radius}
        size={size}
        variant={variant}
        {...props}
      />
    );
  }
);

BaseButton.displayName = 'BaseButton';

export default BaseButton;
