'use client';

import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconPlus, IconSearch, IconDatabaseExclamation, IconEdit, IconTrash } from '@tabler/icons-react';
import BaseTable, { BaseTableColumn } from '@/components/ui/BaseTable';
import { BaseInput } from '@/components/ui';
import { useState } from 'react';

interface ListingPageProps {
  title: string;
  columns?: string[];
  data?: any[];
  onAdd?: () => void;
  description?: string;
}

export default function ListingPage({
  title,
  columns = ['ID', 'Name', 'Status', 'Created', 'Actions'],
  data = [],
  onAdd,
  description,
}: ListingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Sample data for demonstration
  const sampleData = data.length > 0
    ? data
    : [
        { id: 1, name: 'Sample Item 1', status: 'Active', created: '2024-01-15' },
        { id: 2, name: 'Sample Item 2', status: 'Active', created: '2024-01-16' },
        { id: 3, name: 'Sample Item 3', status: 'Inactive', created: '2024-01-17' },
      ];

  // Filter data based on search
  const filteredData = sampleData.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      item.id?.toString().includes(query)
    );
  });

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  // Action button styles matching FieldTable
  const actionButtonStyle = {
    minWidth: 36,
    minHeight: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexShrink: 0,
  };
  const actionIconStyle = { width: 18, height: 18, flexShrink: 0 };

  // Define columns for BaseTable
  const tableColumns: BaseTableColumn<any>[] = columns.map((col) => {
    const colKey = col.toLowerCase().replace(/\s+/g, '');
    
    if (col === 'Status') {
      return {
        key: 'status',
        label: col,
        width: '15%',
        render: (item: any) => (
          <Text
            size="sm"
            c={item.status === 'Active' ? 'green' : 'gray'}
            fw={500}
          >
            {item.status || '-'}
          </Text>
        ),
      };
    }
    if (col === 'Actions') {
      return {
        key: 'actions',
        label: col,
        width: '20%',
        render: (item: any) => (
          <Group justify="flex-start" gap="1" wrap="nowrap">
            <Button
              variant="subtle"
              size="md"
              px="xs"
              style={actionButtonStyle}
              aria-label="Edit item"
            >
              <IconEdit size={18} style={actionIconStyle} />
            </Button>
            <Button
              variant="subtle"
              color="red"
              size="md"
              px="xs"
              style={actionButtonStyle}
              aria-label="Delete item"
            >
              <IconTrash size={18} style={actionIconStyle} />
            </Button>
          </Group>
        ),
      };
    }
    return {
      key: colKey,
      label: col,
      width: col === 'ID' ? '10%' : col === 'Name' ? '25%' : '15%',
      render: (item: any) => (
        <Text size="sm">{item[colKey] || item[col.toLowerCase()] || item[col] || '-'}</Text>
      ),
    };
  });

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
        <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
          <div>
            <Title order={2}>{title}</Title>
            {description && (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            )}
          </div>
          {onAdd && (
            <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
              Add New
            </Button>
          )}
        </Group>

        {/* Search */}
        <Group gap="md" align="stretch" justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
          <BaseInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            style={{ 
              width: "100%",
              maxWidth: 500,
              flex: "1 1 0",
              minWidth: 0
            }}
            styles={{
              input: {
                height: "42px",
                minHeight: "42px",
              },
            }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </Group>

        {/* Table - Scrollable container */}
        <div 
          style={{ 
            flex: "1 1 0",
            minHeight: 0,
            width: "100%",
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <div style={{ 
            width: "100%",
            flex: "1 1 0",
            minHeight: 0,
            maxHeight: "100%",
            overflow: "auto"
          }}>
            <BaseTable
                columns={tableColumns}
                data={paginatedData}
                isLoading={false}
                emptyState={{
                  icon: IconDatabaseExclamation,
                  title: "No Data Found",
                  description: "No items to display. Start by adding your first item.",
                  iconColor: "var(--mantine-color-gray-5)",
                }}
                stickyHeader={true}
                minWidth={600}
                tableLayout="fixed"
                verticalSpacing="sm"
                colgroup={columns.map((col) => {
                  if (col === 'ID') return { width: '10%' };
                  if (col === 'Name') return { width: '25%' };
                  if (col === 'Status') return { width: '15%' };
                  if (col === 'Actions') return { width: '20%' };
                  return { width: '15%' };
                })}
              pagination={
                totalPages > 0
                  ? {
                      page,
                      totalPages,
                      onPageChange: setPage,
                    }
                  : undefined
              }
              />
          </div>
        </div>

      </Stack>
    </Paper>
  );
}

