'use client';

import React, { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActionIcon, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import BaseButton from '@/components/ui/BaseButton';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/use-auth-store';
import CreateFarmModal from './CreateFarmModal';

interface Farm {
  id: string;
  farmId?: string;
  farmName?: string;
  name?: string;
}

interface FarmSwitcherModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function FarmSwitcherModal({ opened, onClose }: FarmSwitcherModalProps) {
  const { farmId, setRoleAndFarm } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['owner-farms'],
    queryFn: async () => {
      const res = await api.get('/api/v1/farms');
      return (res?.data?.data ?? res?.data ?? []) as Farm[];
    },
    enabled: opened,
  });

  const farms = Array.isArray(data) ? data : [];

  const selectFarm = async (f: Farm) => {
    const nextId = f.id ?? f.farmId ?? null;
    if (!nextId) return;
    try {
      await api.post('/api/v1/farms/switch', { farmId: nextId });
      setRoleAndFarm({ farmId: nextId, hasFarm: true });
      // Invalidate the query to refetch farms and update the farm name in the navbar
      await queryClient.invalidateQueries({ queryKey: ['owner-farms'] });
      onClose();
    } catch (e) {
      // noop: you can add a toast here if desired
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Switch farm" centered size="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {isLoading ? 'Loading farms...' : `${farms.length} farm(s)`}
            </Text>
            <BaseButton size="xs" intent="secondary" onClick={() => setCreateOpen(true)}>
              Create new farm
            </BaseButton>
          </Group>

          <ScrollArea.Autosize mah={320}>
            <Stack gap="xs">
              {farms.map((f) => {
                const id = f.id ?? f.farmId ?? '';
                const label = f.farmName ?? f.name ?? id;
                const isActive = farmId && id && farmId === id;
                return (
                  <Group
                    key={id}
                    justify="space-between"
                    style={{
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--mantine-color-gray-3)',
                    }}
                    onClick={() => selectFarm(f)}
                  >
                    <Text>{label}</Text>
                    {isActive ? (
                      <ActionIcon variant="subtle" color="brandGreen">
                        <IconCheck size={16} />
                      </ActionIcon>
                    ) : null}
                  </Group>
                );
              })}
              {!isLoading && farms.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No farms yet. Create your first farm.
                </Text>
              ) : null}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Modal>

      <CreateFarmModal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false);
          void refetch();
        }}
        onCreated={() => {
          setCreateOpen(false);
          void refetch();
        }}
        closable
      />
    </>
  );
}
