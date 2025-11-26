'use client';

import { useRouter } from 'next/navigation';
import { IconArrowRight, IconDroplet, IconLeaf, IconPlant2 } from '@tabler/icons-react';
import { Box, Button, Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import FeaturePill from './FeaturePill';

const HeroSection = () => {
  const router = useRouter();
  return (
    <Box pos="relative" style={{ height: '100vh', overflow: 'hidden' }}>
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

      {/* Green overlay tint */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            'radial-gradient(60% 60% at 20% 20%, rgba(64,160,43,0.35) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Content */}
      <Container
        size="lg"
        py={0}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack gap="lg" maw={880}>
          <Group gap="xs">
            <ThemeIcon size={26} radius="xl" color="lime" variant="light">
              <IconLeaf size={16} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="grape.1" tt="uppercase" style={{ letterSpacing: 1 }}>
              Agriculture & Organic Farms
            </Text>
          </Group>

          <Title order={1} c="white" lh={0.6} fz={{ base: 36, sm: 48, md: 60, lg: 68 }}>
            Rooted in Nature,{' '}
            <Text c="lime.3" fw={700} fz={{ base: 36, sm: 48, md: 60, lg: 68 }}>
              Growing the Future
            </Text>
          </Title>

          <Text c="gray.2" maw={520}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry’s standard dummy text ever since the 1500s.
          </Text>

          <Group>
            <Button
              radius="xl"
              size="md"
              color="lime"
              variant="outline"
              rightSection={<IconArrowRight size={18} />}
              onClick={() => router.push('/login')}
            >
              Sign in
            </Button>

            <Button
              radius="xl"
              size="md"
              color="lime"
              variant="outline"
              rightSection={<IconArrowRight size={18} />}
              onClick={() => router.push('/register')}
            >
              Sign up
            </Button>

            <Button
              radius="xl"
              size="md"
              color="lime"
              variant="outline"
              rightSection={<IconArrowRight size={18} />}
              onClick={() => router.push('/demo')}
            >
              Book a demo
            </Button>
          </Group>

          <Group gap="lg" wrap="wrap">
            <FeaturePill
              icon={IconPlant2}
              title="Healthy Soil Solutions"
              subtitle="Sustainable fertility"
            />
            <FeaturePill
              icon={IconLeaf}
              title="Pure Organic Growth"
              subtitle="Chemical‑free crops"
            />
            <FeaturePill
              icon={IconDroplet}
              title="Nature‑Driven Innovation"
              subtitle="Efficient irrigation"
            />
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
