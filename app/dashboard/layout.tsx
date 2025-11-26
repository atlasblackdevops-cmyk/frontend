import React from 'react';
import NavbarSimple from '@/components/navigation/NavbarSimple';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
      }}
    >
      <NavbarSimple />
      <div
        style={{
          flex: 1,
          padding: 16,
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
