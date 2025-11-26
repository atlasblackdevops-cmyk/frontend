'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Textarea, TextInput } from '@mantine/core';
import { RequireAuth } from '@/components/auth/RequireAuth';
import BaseButton from '@/components/ui/BaseButton';
import BaseCard from '@/components/ui/BaseCard';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/use-auth-store';

export default function CreateFarmPage() {
  const router = useRouter();
  const { setRoleAndFarm } = useAuth();

  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {
      farmName: null,
      city: null,
      state: null,
      country: null,
      address: null,
    };
    if (!farmName || farmName.trim().length < 2) {
      e.farmName = 'Farm name is required (min 2 characters)';
    }
    return e;
  }, [farmName]);

  const isValid = !errors.farmName;

  const handleSubmit = async () => {
    setTouched({ farmName: true, city: true, state: true, country: true, address: true });
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = { name: farmName, city, state, country, address };
      const { data } = await api.post('/api/v1/farms', payload);
      const created = data?.data ?? data ?? {};
      const newFarmId = created?.id ?? created?.farmId ?? null;
      setRoleAndFarm({ hasFarm: true, farmId: newFarmId });
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to create farm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          minHeight: '100dvh',
        }}
      >
        <BaseCard style={{ width: 520 }}>
          <Stack gap="md">
            <h2 style={{ margin: 0 }}>Add farm</h2>
            {error ? (
              <div style={{ color: 'var(--mantine-color-red-6)', fontSize: 14 }}>{error}</div>
            ) : null}
            <TextInput
              label="Farm name"
              placeholder="E.g., Green Valley Farm"
              value={farmName}
              onChange={(e) => setFarmName(e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, farmName: true }))}
              error={touched.farmName && errors.farmName}
              required
            />
            <TextInput
              label="City"
              value={city}
              onChange={(e) => setCity(e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, city: true }))}
              error={touched.city && errors.city}
            />
            <TextInput
              label="State"
              value={state}
              onChange={(e) => setState(e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, state: true }))}
              error={touched.state && errors.state}
            />
            <TextInput
              label="Country"
              placeholder="E.g., USA"
              value={country}
              onChange={(e) => setCountry(e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, country: true }))}
              error={touched.country && errors.country}
            />
            <Textarea
              label="Address"
              placeholder="Street, area, zip"
              minRows={3}
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              error={touched.address && errors.address}
            />

            <BaseButton onClick={handleSubmit} loading={submitting} disabled={!isValid}>
              Create farm
            </BaseButton>
          </Stack>
        </BaseCard>
      </div>
    </RequireAuth>
  );
}
