'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  GraduationCap,
  School,
  BookOpen,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
  BarChart3,
  ClipboardCheck,
  Shield,
  FilePlus,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: string;
}

const menuItems = {
  admin: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Usuarios', href: '/dashboard/users' },
    { icon: GraduationCap, label: 'Aprendices', href: '/dashboard/aprendices' },
    { icon: FileText, label: 'Fichas', href: '/dashboard/fichas' },
    { icon: ClipboardCheck, label: 'Asistencias', href: '/dashboard/asistencias' },
    { icon: Shield, label: 'Disciplinario', href: '/dashboard/disciplinario' },
    { icon: FilePlus, label: 'PTC', href: '/dashboard/ptc' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: School, label: 'Colegios', href: '/dashboard/colegios' },
    { icon: BookOpen, label: 'Programas', href: '/dashboard/programas' },
    { icon: BarChart3, label: 'Estadísticas', href: '/dashboard/stats' },
  ],
  instructor: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Mis Fichas', href: '/dashboard/fichas' },
    { icon: ClipboardCheck, label: 'Asistencias', href: '/dashboard/asistencias' },
    { icon: Shield, label: 'Disciplinario', href: '/dashboard/disciplinario' },
    { icon: FilePlus, label: 'PTC', href: '/dashboard/ptc' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: GraduationCap, label: 'Mis Aprendices', href: '/dashboard/aprendices' },
  ],
  coordinador: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: GraduationCap, label: 'Aprendices', href: '/dashboard/aprendices' },
    { icon: FileText, label: 'Fichas', href: '/dashboard/fichas' },
    { icon: ClipboardCheck, label: 'Asistencias', href: '/dashboard/asistencias' },
    { icon: Shield, label: 'Disciplinario', href: '/dashboard/disciplinario' },
    { icon: FilePlus, label: 'PTC', href: '/dashboard/ptc' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: School, label: 'Colegios', href: '/dashboard/colegios' },
    { icon: BookOpen, label: 'Programas', href: '/dashboard/programas' },
    { icon: BarChart3, label: 'Reportes', href: '/dashboard/stats' },
  ],
};

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const items = menuItems[userRole as keyof typeof menuItems] || menuItems.admin;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-green-600 text-white p-2 rounded-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-green-800 to-green-900 text-white transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-green-700">
            <h1 className="text-2xl font-bold">AppSena</h1>
            <p className="text-sm text-green-200 mt-1">Sistema de Gestión</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-green-700 text-white shadow-lg'
                          : 'text-green-100 hover:bg-green-700/50'
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-green-700">
            <div className="flex items-center space-x-3 px-4 py-3">
              <UserCircle size={24} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Usuario</p>
                <p className="text-xs text-green-200 truncate capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-green-100 hover:bg-green-700/50 rounded-lg transition-colors mt-2"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
