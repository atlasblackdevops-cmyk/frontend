'use client';

import { Box, Container, Grid, Group, Image, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconLeaf } from '@tabler/icons-react';

type BadgeProps = {
  num: string;
  title: string;
};

function GlowBadge({ num, title }: BadgeProps) {
  return (
    <Stack gap={6} align="center" ta="center">
      <Box
        w={56}
        h={56}
        style={{
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0) 70%)',
          boxShadow:
            '0 0 0 6px rgba(255,255,255,0.25), 0 0 18px 6px rgba(201, 255, 140, 0.45), 0 0 48px 12px rgba(201,255,140,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text fw={800} c="dark" fz="lg">
          {num}
        </Text>
      </Box>
      <Text c="white" fz="sm" fw={600} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
        {title}
      </Text>
    </Stack>
  );
}

const WhyChooseUs = () => {
  return (
    <Box pos="relative">
      {/* background */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          backgroundImage: "url('https://agrezen.zozothemes.com/wp-content/uploads/2025/10/service-bg-3.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      />
      {/* overlay gradient */}
      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 10%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      <Container size="lg" py={{ base: 60, md: 90 }} style={{ position: 'relative', zIndex: 1 }}>
        <Stack gap="lg" align="center">
          <Group gap="xs">
            <ThemeIcon size={26} radius="xl" color="lime" variant="light">
              <IconLeaf size={16} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dark.3" tt="uppercase" style={{ letterSpacing: 1 }}>
              Why Choose Our Farm
            </Text>
          </Group>

          <Title order={1} ta="center" c="dark" lh={1.1} fz={{ base: 30, sm: 40, md: 46 }}>
            Rooted in Nature, Growing
            <br />
            with Honest Purpose
          </Title>

          <Grid gutter={{ base: 24, md: 36 }} mt="sm" align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <GlowBadge num="01" title="Health From the Earth" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <GlowBadge num="02" title="Rooted in Sustainable Growth" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <GlowBadge num="03" title="Technology Meets the Soil Flow" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <GlowBadge num="04" title="Fields of Shared Prosperity" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <GlowBadge num="05" title="Seeds Sprouting Sustainable" />
            </Grid.Col>
            {/* placeholder for layout spacing to center badges above tractor on large screens */}
            <Grid.Col span={{ base: 0, md: 2 }} />
          </Grid>

          {/* Tractor image */}
          <Box
            mt={{ base: 20, md: 30 }}
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Image
              src="https://agrezen.zozothemes.com/wp-content/uploads/2025/10/shape-9.webp"
              alt="Tractor"
              w={{ base: 300, sm: 420, md: 560 }}
              fit="contain"
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default WhyChooseUs;