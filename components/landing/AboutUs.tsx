'use client';

import { Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconLeaf, IconTrees, IconPlant2, IconTractor, IconGrain } from '@tabler/icons-react';

type Feature = {
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    icon: IconTrees,
    title: 'Farm Development',
    desc: 'Lorem Ipsum is simply dummy text of the printing industry.'
  },
  {
    icon: IconPlant2,
    title: 'Crop Management',
    desc: 'Lorem Ipsum is simply dummy text of the printing industry.'
  },
  {
    icon: IconTractor,
    title: 'Soil Restoration',
    desc: 'Lorem Ipsum is simply dummy text of the printing industry.'
  },
  {
    icon: IconGrain,
    title: 'Organic Cultivation',
    desc: 'Lorem Ipsum is simply dummy text of the printing industry.'
  }
];

function FeatureItem({ icon: Icon, title, desc }: Feature) {
  return (
    <Stack gap={8}>
      <Icon size={64} color="var(--mantine-color-lime-7)" stroke={1.3} />
      <Text fw={700} fz={{ base: 18, md: 20 }}>{title}</Text>
      <Text c="dimmed" fz="sm">{desc}</Text>
    </Stack>
  );
}

const AboutUs = () => {
  return (
    <Container size="lg" py={{ base: 50, md: 80 }}>
      <Stack gap="xl">
        <Group gap="xs">
          <ThemeIcon size={26} radius="xl" color="lime" variant="light">
            <IconLeaf size={16} />
          </ThemeIcon>
          <Text size="sm" fw={700} c="dark.3" tt="uppercase" style={{ letterSpacing: 1 }}>
            About Us
          </Text>
        </Group>

        <Title order={1} lh={1.2} fz={{ base: 34, sm: 44, md: 56 }}>
          Innovating Agriculture,
          <br />
          Sustaining Our Future
        </Title>

        <Grid gutter={{ base: 24, md: 40 }} mt="md">
          {FEATURES.map((f) => (
            <Grid.Col key={f.title} span={{ base: 12, sm: 6, md: 3 }}>
              <FeatureItem {...f} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};

export default AboutUs;