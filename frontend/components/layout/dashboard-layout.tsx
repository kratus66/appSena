'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

export function DashboardLayout({ children, userRole = 'admin' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      
      <div className="lg:pl-64">
        <Navbar />
        
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
