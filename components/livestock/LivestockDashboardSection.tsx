"use client";

import { Paper, Stack, Title, Text } from "@mantine/core";
import LivestockDashboard from "./components/LivestockDashboard";

export default function LivestockDashboardSection() {
  return (
    <Paper 
      p={26} 
      radius="none" 
      withBorder={false} 
      style={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Stack gap="lg" style={{ flex: 1, minHeight: 0, overflow: "hidden", alignItems: "stretch" }}>
        {/* Header */}
        <div style={{ flexShrink: 0 }}>
          <Title order={2}>Livestock Dashboard</Title>
          <Text c="dimmed" size="sm">
            Overview of your livestock management and statistics
          </Text>
        </div>

        {/* Dashboard Content */}
        <div style={{ flex: "1 1 0", minHeight: 0, overflow: "auto" }}>
          <LivestockDashboard />
        </div>
      </Stack>
    </Paper>
  );
}

