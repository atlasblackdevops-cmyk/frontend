import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AuthenticationForm } from '@/components/auth/AuthenticationForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { GuestOnly } from '@/components/auth/GuestOnly';

// Mark this page as dynamic since it uses auth() which requires server-side rendering
export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  // Handle auth errors gracefully - if auth fails, treat as unauthenticated
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    // If auth check fails (e.g., UntrustedHost error), treat as unauthenticated
    console.error("Auth check failed:", error);
    session = null;
  }

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
