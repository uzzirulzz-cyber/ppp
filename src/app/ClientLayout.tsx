'use client';

import React from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily:
          'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {children}
    </div>
  );
}