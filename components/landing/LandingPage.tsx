'use client';

import { useRouter } from 'next/navigation';
import { Button, Container, Grid, Paper, Stack, Text } from '@mantine/core';
import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import { useAuth } from '@/stores/use-auth-store';
import { DemoForm } from './DemoForm';
import { Features } from './Features';
import { Hero } from './Hero';

export function LandingPage() {
  const { token } = useAuth();
  const router = useRouter();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Hero />
        <Features />
        <Grid id="auth" gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DemoForm />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Text fw={600} size="lg">
                  Access your account
                </Text>
                {token ? (
                  <Button radius="xl" onClick={() => router.push('/dashboard')}>
                    Go to dashboard
                  </Button>
                ) : (
                  <AuthenticationForm initialType="login" />
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
