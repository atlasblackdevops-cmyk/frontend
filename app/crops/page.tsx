import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import { Stack, Title, Text, Paper } from '@mantine/core';

export default function CropsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <Stack gap="lg">
            <div>
              <Title order={2}>Crops</Title>
              <Text c="dimmed" size="sm">
                Manage crop plantings and track your agricultural operations
              </Text>
            </div>
            <Paper p="xl" withBorder>
              <Text c="dimmed" ta="center">
                Select a submodule from the navigation menu to get started.
              </Text>
            </Paper>
          </Stack>
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}
