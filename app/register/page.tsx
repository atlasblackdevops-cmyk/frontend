import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { GuestOnly } from '@/components/auth/GuestOnly';

export default async function RegisterPage() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <GuestOnly to="/dashboard">
      <AuthLayout>
        <AuthenticationForm initialType="register" />
      </AuthLayout>
    </GuestOnly>
  );
}
