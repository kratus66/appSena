import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import api from '@/lib/api';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/api', () => ({
  default: { post: vi.fn() },
}));

describe('LoginPage — sesión por cookie (regresión SEC-5)', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    vi.mocked(api.post).mockReset();
  });

  it('en un login exitoso, guarda el perfil (no el token) y navega al dashboard', async () => {
    const user = { id: 'u1', nombre: 'Admin', email: 'admin@sena.edu.co', rol: 'admin' };
    vi.mocked(api.post).mockResolvedValue({ data: { user } });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), user.email);
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Admin123!');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: user.email,
      password: 'Admin123!',
    });
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(user);
    // La sesión vive en la cookie httpOnly del backend, nunca en localStorage.
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('muestra el mensaje de error del backend y no navega si las credenciales son inválidas', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@sena.edu.co');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'mala-clave');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
