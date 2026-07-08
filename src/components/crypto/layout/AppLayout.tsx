'use client';

import { type ReactNode } from 'react';
import Sidebar from '@/components/crypto/layout/Sidebar';
import Header from '@/components/crypto/layout/Header';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Sidebar renders both desktop (fixed) and mobile (overlay) variants internally */}
      <Sidebar />

      {/* Main content area — offset left on desktop for fixed sidebar */}
      <div className="flex flex-col transition-all duration-300 lg:pl-[260px]">
        {/* Fixed header spans full remaining width */}
        <Header />

        {/* Page content, padded below fixed header */}
        <main className="min-h-[calc(100vh-4rem)] pt-16">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}