import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  default: { post: vi.fn().mockResolvedValue({}) },
}));

describe('Sidebar — navegación por rol (regresión: no debe asumir admin por defecto)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('un INSTRUCTOR ve "Mis Fichas" pero no ve "Usuarios" ni "Colegios"', () => {
    localStorage.setItem('user', JSON.stringify({ rol: 'instructor', email: 'i@sena.edu.co' }));

    render(<Sidebar />);

    expect(screen.getByText('Mis Fichas')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Colegios')).not.toBeInTheDocument();
  });

  it('un ADMIN ve el módulo de "Usuarios"', () => {
    localStorage.setItem('user', JSON.stringify({ rol: 'admin', email: 'a@sena.edu.co' }));

    render(<Sidebar />);

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('sin usuario válido en localStorage, NO muestra navegación de admin por defecto', () => {
    // localStorage vacío / sin `user` — antes esto caía a rol 'admin' por defecto
    render(<Sidebar />);

    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Colegios')).not.toBeInTheDocument();
    expect(screen.queryByText('Mis Fichas')).not.toBeInTheDocument();
  });

  it('con un `user` corrupto en localStorage, tampoco cae a admin por defecto', () => {
    localStorage.setItem('user', 'esto-no-es-json-valido');

    render(<Sidebar />);

    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });
});
