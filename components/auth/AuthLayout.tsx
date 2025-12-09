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
    <Box 
      pos="relative" 
      mih="100dvh" 
      style={{ 
        overflow: 'hidden',
      }}
    >
      {/* Background image - same as landing page */}
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

      {/* Green overlay tint - same as landing page */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            'radial-gradient(60% 60% at 20% 20%, rgba(64,160,43,0.35) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.65) 100%)',
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
          padding: '24px',
          overflow: 'hidden',
        }}
      >
        <Stack gap="xl" w="100%" maw={440} align="center" style={{ maxHeight: '100%' }}>
          {/* Modern flat logo/title */}
          <Stack gap="xs" align="center" mb="md">
            {/* <Text
              fw={700}
              ta="center"
              style={{ 
                lineHeight: 1.2,
                fontSize: '28px',
                letterSpacing: '-0.5px',
              }}
            >
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'opacity 0.2s',
                  color: '#2e7d32',
                  background: 'linear-gradient(135deg, #4caf50 0%, #ff9800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
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
            <Text
              size="sm"
              c="dimmed"
              ta="center"
              style={{
                fontWeight: 400,
                letterSpacing: '0.2px',
              }}
            >
              Manage your farm efficiently
            </Text> */}
          </Stack>

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
