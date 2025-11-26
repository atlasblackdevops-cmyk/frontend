'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Container, Stack, Text } from '@mantine/core';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <Box pos="relative" mih="100dvh" style={{ overflow: 'hidden' }}>
      {/* Background image */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          backgroundImage: "url('/assets/images/farm-landing-banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)',
        }}
      />

      {/* Green/Orange overlay tint with modern flat look */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            'radial-gradient(60% 60% at 20% 20%, rgba(64,160,43,0.4) 0%, rgba(255,152,64,0.25) 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Content - Centered */}
      <Container
        size="sm"
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          overflow: 'hidden',
        }}
      >
        <Stack gap={{ base: 'xs', sm: 'sm' }} w="100%" maw={480} align="center" style={{ maxHeight: '100%' }}>
          {/* Welcome to Farm Management - One line */}
          <Text
            fw={700}
            ta="center"
            style={{ lineHeight: 1.2 }}
          >
            <span style={{ color: '#4caf50', fontSize: 'var(--mantine-font-size-md)' }}>Welcome to </span>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'opacity 0.2s',
                color: 'var(--mantine-color-lime-3)',
                fontSize: 'var(--mantine-font-size-xl)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Farm Management
            </Link>
          </Text>

          {/* Form Card */}
          <Box w="100%">
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default AuthLayout;
