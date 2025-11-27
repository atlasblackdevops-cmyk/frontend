'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Avatar,
  FileButton,
  Button,
  Text,
  Divider,
  Group,
  Paper,
  Title,
  Alert,
  Textarea,
} from '@mantine/core';
import { IconUser, IconBuilding, IconAlertCircle, IconUpload, IconX } from '@tabler/icons-react';
import { useAuth } from '@/stores/use-auth-store';
import BaseButton from '@/components/ui/BaseButton';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
  const { role, userName, userEmail, userProfilePicture, setUserData, farmId } = useAuth();
  const isOwner = (role ?? '').toUpperCase() === 'OWNER';

  // User details state
  const [userNameValue, setUserNameValue] = useState(userName || '');
  const [userEmailValue, setUserEmailValue] = useState(userEmail || '');
  const [userProfilePictureFile, setUserProfilePictureFile] = useState<File | null>(null);
  const [userProfilePicturePreview, setUserProfilePicturePreview] = useState<string | null>(
    userProfilePicture || null
  );
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState(false);

  // Farm details state
  const [farmName, setFarmName] = useState('');
  const [farmLogoFile, setFarmLogoFile] = useState<File | null>(null);
  const [farmLogoPreview, setFarmLogoPreview] = useState<string | null>(null);
  const [farmCity, setFarmCity] = useState('');
  const [farmState, setFarmState] = useState('');
  const [farmCountry, setFarmCountry] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [farmSubmitting, setFarmSubmitting] = useState(false);
  const [farmError, setFarmError] = useState<string | null>(null);
  const [farmSuccess, setFarmSuccess] = useState(false);

  // Fetch farm details
  const { data: farmData, refetch: refetchFarm } = useQuery({
    queryKey: ['farm-details', farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const res = await api.get(`/api/v1/farms/${farmId}`);
      return res?.data?.data ?? res?.data ?? null;
    },
    enabled: !!farmId && isOwner,
  });

  // Update farm state when data is fetched
  useEffect(() => {
    if (farmData) {
      setFarmName(farmData.farmName || farmData.name || '');
      setFarmLogoPreview(farmData.farmLogo || farmData.logo || null);
      setFarmCity(farmData.city || '');
      setFarmState(farmData.state || '');
      setFarmCountry(farmData.country || '');
      setFarmAddress(farmData.address || '');
    } else {
      setFarmName('');
      setFarmLogoPreview(null);
      setFarmCity('');
      setFarmState('');
      setFarmCountry('');
      setFarmAddress('');
    }
  }, [farmData]);

  // Update user state when auth store changes
  useEffect(() => {
    setUserNameValue(userName || '');
    setUserEmailValue(userEmail || '');
    setUserProfilePicturePreview(userProfilePicture || null);
  }, [userName, userEmail, userProfilePicture]);

  // Handle user profile picture change
  const handleUserProfilePictureChange = (file: File | null) => {
    if (file) {
      setUserProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  // User details validation
  const userErrors = useMemo(() => {
    const e: Record<string, string | null> = {
      name: null,
      email: null,
    };
    if (!userNameValue || userNameValue.trim().length < 2) {
      e.name = 'Name is required (min 2 characters)';
    }
    if (!userEmailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmailValue)) {
      e.email = 'Valid email is required';
    }
    return e;
  }, [userNameValue, userEmailValue]);

  const isUserFormValid = !userErrors.name && !userErrors.email;

  // Farm details validation
  const farmErrors = useMemo(() => {
    const e: Record<string, string | null> = {
      farmName: null,
    };
    if (!farmName || farmName.trim().length < 2) {
      e.farmName = 'Farm name is required (min 2 characters)';
    }
    return e;
  }, [farmName]);

  const isFarmFormValid = !farmErrors.farmName;

  // Handle user details update
  const handleUserUpdate = async () => {
    setUserError(null);
    setUserSuccess(false);
    if (!isUserFormValid) return;

    setUserSubmitting(true);
    try {
      const formData = new FormData();
      if (userNameValue.trim()) {
        formData.append('name', userNameValue.trim());
      }
      if (userEmailValue.trim()) {
        formData.append('email', userEmailValue.trim().toLowerCase());
      }
      if (userProfilePictureFile) {
        formData.append('profilePicture', userProfilePictureFile);
      }

      const { data } = await api.put('/api/v1/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedData = data?.data ?? data ?? {};
      
      // Update auth store
      setUserData({
        name: updatedData.name ?? userNameValue.trim(),
        email: updatedData.email ?? userEmailValue.trim().toLowerCase(),
        profilePicture: updatedData.profilePicture ?? userProfilePicturePreview,
      });

      setUserProfilePictureFile(null);
      setUserSuccess(true);
      setTimeout(() => setUserSuccess(false), 3000);
    } catch (e: any) {
      setUserError(e?.response?.data?.message ?? e?.message ?? 'Failed to update profile');
    } finally {
      setUserSubmitting(false);
    }
  };

  // Handle farm details update
  const handleFarmUpdate = async () => {
    setFarmError(null);
    setFarmSuccess(false);
    if (!isFarmFormValid || !farmId) return;

    setFarmSubmitting(true);
    try {
      const formData = new FormData();
      if (farmName.trim()) formData.append('farmName', farmName.trim());
      if (farmCity.trim()) formData.append('city', farmCity.trim());
      if (farmState.trim()) formData.append('state', farmState.trim());
      if (farmCountry.trim()) formData.append('country', farmCountry.trim());
      if (farmAddress.trim()) formData.append('address', farmAddress.trim());
      if (farmLogoFile) formData.append('farmLogo', farmLogoFile);

      await api.put(`/api/v1/farms/${farmId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFarmLogoFile(null);
      setFarmSuccess(true);
      setTimeout(() => setFarmSuccess(false), 3000);
      refetchFarm();
    } catch (e: any) {
      setFarmError(e?.response?.data?.message ?? e?.message ?? 'Failed to update farm details');
    } finally {
      setFarmSubmitting(false);
    }
  };

  return (
    <Stack gap="xl" p="md">
      <Title order={2}>Settings</Title>

      {/* User Details Section */}
      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconUser size={20} />
            <Title order={3}>User Details</Title>
          </Group>
          <Divider />

          {userError && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {userError}
            </Alert>
          )}

          {userSuccess && (
            <Alert icon={<IconAlertCircle size={16} />} title="Success" color="green">
              Profile updated successfully!
            </Alert>
          )}

          <Stack gap="md">
            {/* Profile Picture */}
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Profile Picture
              </Text>
              <Group gap="md">
                <Avatar
                  src={userProfilePicturePreview}
                  size={80}
                  radius="md"
                  alt="Profile picture"
                />
                <Stack gap="xs">
                  <FileButton
                    onChange={handleUserProfilePictureChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                  >
                    {(props) => (
                      <Button
                        {...props}
                        leftSection={<IconUpload size={16} />}
                        variant="light"
                        size="sm"
                      >
                        Upload Photo
                      </Button>
                    )}
                  </FileButton>
                  {userProfilePicturePreview && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="sm"
                      leftSection={<IconX size={16} />}
                      onClick={() => {
                        setUserProfilePictureFile(null);
                        setUserProfilePicturePreview(userProfilePicture || null);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </Group>
            </Stack>

            {/* Name */}
            <TextInput
              label="Name"
              placeholder="Enter your name"
              value={userNameValue}
              onChange={(e) => setUserNameValue(e.currentTarget.value)}
              error={userErrors.name}
              required
            />

            {/* Email */}
            <TextInput
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={userEmailValue}
              onChange={(e) => setUserEmailValue(e.currentTarget.value)}
              error={userErrors.email}
              required
            />

            <BaseButton
              onClick={handleUserUpdate}
              loading={userSubmitting}
              disabled={!isUserFormValid}
            >
              Update Profile
            </BaseButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Farm Details Section (owners only) */}
      {isOwner && (
        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <Group gap="xs">
              <IconBuilding size={20} />
              <Title order={3}>Farm Details</Title>
            </Group>
            <Divider />

            {farmError && (
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                {farmError}
              </Alert>
            )}

            {farmSuccess && (
              <Alert icon={<IconAlertCircle size={16} />} title="Success" color="green">
                Farm details updated successfully!
              </Alert>
            )}

            <Stack gap="md">
              {/* Farm Logo */}
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Farm Logo
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
                          setFarmLogoPreview(farmData?.farmLogo || farmData?.logo || null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>
                </Group>
              </Stack>

              {/* Farm Name */}
              <TextInput
                label="Farm Name"
                placeholder="Enter farm name"
                value={farmName}
                onChange={(e) => setFarmName(e.currentTarget.value)}
                error={farmErrors.farmName}
                required
              />

              <TextInput
                label="City"
                placeholder="Enter city"
                value={farmCity}
                onChange={(e) => setFarmCity(e.currentTarget.value)}
              />

              <TextInput
                label="State"
                placeholder="Enter state"
                value={farmState}
                onChange={(e) => setFarmState(e.currentTarget.value)}
              />

              <TextInput
                label="Country"
                placeholder="Enter country"
                value={farmCountry}
                onChange={(e) => setFarmCountry(e.currentTarget.value)}
              />

              <Textarea
                label="Address"
                placeholder="Street, area, zip"
                minRows={3}
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.currentTarget.value)}
              />

              <BaseButton
                onClick={handleFarmUpdate}
                loading={farmSubmitting}
                disabled={!isFarmFormValid}
              >
                Update Farm Details
              </BaseButton>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

