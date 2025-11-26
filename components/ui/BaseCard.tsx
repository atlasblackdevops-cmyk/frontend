'use client';

import React from 'react';
import { Paper, PaperProps } from '@mantine/core';

export interface BaseCardProps extends PaperProps {
  elevated?: boolean;
  children?: React.ReactNode;
}

export default function BaseCard({
  elevated = false,
  radius = 'md',
  p = 'md',
  withBorder = true,
  shadow,
  ...props
}: BaseCardProps) {
  const resolvedShadow = shadow ?? (elevated ? 'xs' : 'none');
  return <Paper radius={radius} p={p} withBorder={withBorder} shadow={resolvedShadow} {...props} />;
}
