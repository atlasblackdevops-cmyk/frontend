'use client';

import { Box, Button, Container, Grid, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconLeaf, IconArrowRight } from '@tabler/icons-react';

type StatCardProps = {
  image: string;
  percent: string;
  label: string;
  objectPosition?: string;
};

function StatCard({ image, percent, label, objectPosition }: StatCardProps) {
  return (
    <Paper withBorder radius="lg" style={{ position: 'relative', overflow: 'hidden', borderColor:'#000' }}>
      <Box
        style={{
          position: 'relative',
          backgroundImage: `url('${image}')`,
          backgroundSize: '215px auto',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: objectPosition ?? 'bottom center',
          padding: "250px 35px 30px",
        }}
      >
        <Stack gap={0} >
          <Text fw={800} fz={42} lh={1}>
            {percent}
          </Text>
          <Text c="lime.8"  fw={600}>
            {label}
          </Text>
        </Stack>
      </Box>
    </Paper>
  );
}

const Sustainable = () => {
  return (
    <Container size="lg" py={{ base: 50, md: 80 }}>
      <Stack gap="xl">
        <Group gap="xs">
          <ThemeIcon size={26} radius="xl" color="lime" variant="light">
            <IconLeaf size={16} />
          </ThemeIcon>
          <Text size="sm" fw={700} c="dark.3" tt="uppercase" style={{ letterSpacing: 1 }}>
            Sustainable Farming
          </Text>
        </Group>

        <Grid align="center" gutter={{ base: 24, md: 40 }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Title order={1} lh={1.05} fz={{ base: 34, sm: 44, md: 54 }}>
              Cultivating Excellence in
              <br />
              Every Green Field
            </Title>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Text c="dimmed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry’s standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled.
              </Text>
             
            </Stack>
          </Grid.Col>
        </Grid>
        <Group justify="center" m="lg" hiddenFrom='md'>
                <Button radius="xl" size="md" color="lime" rightSection={<IconArrowRight size={18} />}>
                  Get In Touch
                </Button>
              </Group>
        <Grid gutter={{ base: 24, md: 28 }} mt="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <StatCard
              image="https://agrezen.zozothemes.com/wp-content/uploads/2025/10/shape-6.webp"
              percent="80%"
              label="Efficiency"
              objectPosition="bottom right"
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
          <Group justify="center" m="lg" visibleFrom='md'>
                <Button radius="xl" size="md" color="lime" rightSection={<IconArrowRight size={18} />}>
                  Get In Touch
                </Button>
              </Group>
            <StatCard
              image="https://agrezen.zozothemes.com/wp-content/uploads/2025/10/shape-20.webp"
              percent="98%"
              label="Increase in Yields"
              objectPosition="bottom right"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <StatCard
              image="https://agrezen.zozothemes.com/wp-content/uploads/2025/10/shape-5.webp"
              percent="50%"
              label="Farm Growth"
              objectPosition="bottom right"
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default Sustainable;