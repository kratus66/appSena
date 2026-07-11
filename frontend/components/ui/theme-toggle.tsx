'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

/** Alterna entre tema claro y oscuro, persistiendo la elección en localStorage. */
export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    const next = !el.classList.contains('dark');
    el.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="h-10 w-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
    >
      {/* Evita el desajuste de hidratación mostrando el icono solo tras montar */}
      {mounted && (dark ? <Sun size={20} /> : <Moon size={20} />)}
    </button>
  );
}
