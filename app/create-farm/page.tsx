'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Textarea, TextInput, FileButton, Button, Group, Avatar, Text } from '@mantine/core';
import { IconUpload, IconBuilding, IconX } from '@tabler/icons-react';
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
  const [farmLogoFile, setFarmLogoFile] = useState<File | null>(null);
  const [farmLogoPreview, setFarmLogoPreview] = useState<string | null>(null);
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

  // Handle farm logo change
  const handleFarmLogoChange = (file: File | null) => {
    if (file) {
      setFarmLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFarmLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setTouched({ farmName: true, city: true, state: true, country: true, address: true });
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('farmName', farmName.trim());
      if (city) formData.append('city', city.trim());
      if (state) formData.append('state', state.trim());
      if (country) formData.append('country', country.trim());
      if (address) formData.append('address', address.trim());
      if (farmLogoFile) {
        formData.append('farmLogo', farmLogoFile);
      }

      const { data } = await api.post('/api/v1/farms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
            
            {/* Farm Logo */}
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Farm Logo (Optional)
              </Text>
              <Group gap="md">
                {farmLogoPreview ? (
                  <Avatar
                    src={farmLogoPreview}
                    size={80}
                    radius="md"
                    alt="Farm logo"
                    variant="light"
                  />
                ) : (
                  <Avatar size={80} radius="md" variant="light" color="gray">
                    <IconBuilding size={40} />
                  </Avatar>
                )}
                <Stack gap="xs">
                  <FileButton
                    onChange={handleFarmLogoChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                  >
                    {(props) => (
                      <Button
                        {...props}
                        leftSection={<IconUpload size={16} />}
                        variant="light"
                        size="sm"
                      >
                        Upload Logo
                      </Button>
                    )}
                  </FileButton>
                  {farmLogoPreview && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="sm"
                      leftSection={<IconX size={16} />}
                      onClick={() => {
                        setFarmLogoFile(null);
                        setFarmLogoPreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </Group>
            </Stack>

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

            <BaseButton type="button" onClick={handleSubmit} loading={submitting} disabled={!isValid}>
              Create farm
            </BaseButton>
          </Stack>
        </BaseCard>
      </div>
    </RequireAuth>
  );
}
