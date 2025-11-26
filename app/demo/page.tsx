import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { DemoForm } from '@/components/landing/DemoForm';

export default function DemoPage() {
  return (
    <AuthLayout title="Book your free demo" subtitle="Tell us a bit about your needs">
      <DemoForm />
    </AuthLayout>
  );
}
