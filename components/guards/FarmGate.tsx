'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/use-auth-store';
import { api } from '@/lib/api';
import CreateFarmModal from '@/components/farm/CreateFarmModal';

interface FarmGateProps {
  children: React.ReactNode;
}

export default function FarmGate({ children }: FarmGateProps) {
  const router = useRouter();
  const { role, hasFarm, token, setRoleAndFarm } = useAuth();

  // Check if user is OWNER or ADMIN and needs a farm
  const roleUpper = String(role ?? '').toUpperCase();
  const needsFarm =
    (roleUpper === 'OWNER' || roleUpper === 'ADMIN') && hasFarm === false;

  // Refetch user state after farm creation to ensure sync with backend
  const handleFarmCreated = async () => {
    if (!token) return;
    try {
      const me = await api.get('/api/v1/auth/me');
      const meData = me?.data ?? {};
      const payload = meData?.data ?? meData;

      // Normalize role name
      const rawRole = payload?.role ?? payload?.user?.role ?? payload?.data?.role ?? null;
      const roleName =
        (typeof rawRole === 'string' && rawRole) ||
        rawRole?.roleName ||
        rawRole?.name ||
        payload?.user?.roleName ||
        null;

      // Derive hasFarm with fallbacks
      let hasFarmVal: boolean | null =
        typeof payload?.hasFarm === 'boolean' ? payload.hasFarm : null;
      if (hasFarmVal == null) {
        if (payload?.requiresFarmCreation === true) hasFarmVal = false;
        else if (payload?.currentFarm != null) hasFarmVal = true;
      }

      const farmId =
        payload?.farmId ??
        payload?.defaultFarmId ??
        payload?.currentFarm?.id ??
        payload?.user?.farmId ??
        payload?.data?.farmId ??
        null;

      setRoleAndFarm({
        role: roleName ?? null,
        hasFarm: typeof hasFarmVal === 'boolean' ? hasFarmVal : null,
        farmId,
      });

      // Store user data (name, email, profilePicture)
      const { setUserData } = useAuth.getState();
      setUserData({
        name: payload?.name ?? null,
        email: payload?.email ?? null,
        profilePicture: payload?.profilePicture ?? null,
      });

      // Refresh the page to ensure all components are updated
      router.refresh();
    } catch (err) {
      // If refetch fails, still refresh to let the session provider handle it
      router.refresh();
    }
  };

  return (
    <>
      {children}
      <CreateFarmModal
        opened={needsFarm}
        onClose={() => {
          // Keep modal open until farm is created - do nothing on close attempt
        }}
        closable={false}
        onCreated={handleFarmCreated}
      />
    </>
  );
}
