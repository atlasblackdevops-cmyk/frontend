'use client';

import { Button, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface ListingPageProps {
  title: string;
  columns?: string[];
  data?: any[];
  onAdd?: () => void;
}

export default function ListingPage({
  title,
  columns = ['ID', 'Name', 'Status', 'Created', 'Actions'],
  data = [],
  onAdd,
}: ListingPageProps) {
  // Sample data for demonstration
  const sampleData = data.length > 0
    ? data
    : [
        { id: 1, name: 'Sample Item 1', status: 'Active', created: '2024-01-15' },
        { id: 2, name: 'Sample Item 2', status: 'Active', created: '2024-01-16' },
        { id: 3, name: 'Sample Item 3', status: 'Inactive', created: '2024-01-17' },
      ];

  const rows = sampleData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.id}</Table.Td>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>
        <Text
          size="sm"
          c={item.status === 'Active' ? 'green' : 'gray'}
          fw={500}
        >
          {item.status}
        </Text>
      </Table.Td>
      <Table.Td>{item.created}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs">
            Edit
          </Button>
          <Button variant="subtle" color="red" size="xs">
            Delete
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg" p="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        {onAdd && (
          <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add New
          </Button>
        )}
      </Group>

      <Paper withBorder radius="md" p="md">
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th key={column}>{column}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>
                    <Text c="dimmed">No data available</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Stack>
  );
}

