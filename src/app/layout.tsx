// app/layout.tsx
import './globals.css';
import React, { ReactNode } from 'react';
import ResponsiveLogo from './components/ResponsiveLogo';

export const metadata = {
  title: 'Kufah Attendance',
  description: 'School Attendance System',
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className="bg-white">
        {/* Header with responsive logo */}
        <header className="flex items-center p-4">
          <ResponsiveLogo />
        </header>

        {/* Main content */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
