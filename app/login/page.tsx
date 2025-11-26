import React from 'react';

import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { GuestOnly } from '@/components/auth/GuestOnly';

export default async function LoginPage() {

  return (
    <GuestOnly to="/dashboard">
      <AuthLayout>
        <AuthenticationForm initialType="login" />
      </AuthLayout>
    </GuestOnly>
  );
}
