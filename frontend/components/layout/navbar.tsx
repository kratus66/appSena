'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';

export function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center flex-1 space-x-4">
        <div className="hidden lg:block w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationsDropdown />
      </div>
    </header>
  );
}
