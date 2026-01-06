'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { User, UserRole } from '@/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole?: UserRole;
}

export function CreateUserModal({ isOpen, onClose, onSuccess, currentUserRole = 'admin' }: CreateUserModalProps) {
  const [formData, setFormData] = React.useState({
    nombre: '',
    email: '',
    password: '',
    documento: '',
    telefono: '',
    rol: 'aprendiz' as UserRole,
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Determinar roles permitidos según el rol del usuario actual
  const getAllowedRoles = (): { value: UserRole; label: string }[] => {
    switch (currentUserRole) {
      case 'admin':
        return [
          { value: 'coordinador', label: 'Coordinador' },
          { value: 'instructor', label: 'Instructor' },
          { value: 'aprendiz', label: 'Aprendiz' },
        ];
      case 'coordinador':
        return [
          { value: 'instructor', label: 'Instructor' },
          { value: 'aprendiz', label: 'Aprendiz' },
        ];
      case 'instructor':
        return [
          { value: 'aprendiz', label: 'Aprendiz' },
        ];
      default:
        return [];
    }
  };

  const allowedRoles = getAllowedRoles();

  React.useEffect(() => {
    if (isOpen && allowedRoles.length > 0) {
      setFormData((prev) => ({ ...prev, rol: allowedRoles[0].value }));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.email || !formData.password || !formData.documento) {
      setError('Por favor completa todos los campos obligatorios');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/users', formData);
      
      // Resetear formulario
      setFormData({
        nombre: '',
        email: '',
        password: '',
        documento: '',
        telefono: '',
        rol: allowedRoles[0]?.value || 'aprendiz',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        setError(errorMessage.join(', '));
      } else {
        setError(errorMessage || 'Error al crear el usuario. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (allowedRoles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Acceso Denegado</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  No tienes permisos para crear usuarios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-950">Crear Nuevo Usuario</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {currentUserRole === 'admin' && 'Como administrador, puedes crear coordinadores, instructores y aprendices.'}
            {currentUserRole === 'coordinador' && 'Como coordinador, puedes crear instructores y aprendices.'}
            {currentUserRole === 'instructor' && 'Como instructor, puedes crear aprendices.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-bold text-gray-950 mb-2">
                  Nombre Completo *
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="documento" className="block text-sm font-bold text-gray-950 mb-2">
                  Documento *
                </label>
                <Input
                  id="documento"
                  name="documento"
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={formData.documento}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-950 mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@sena.edu.co"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-bold text-gray-950 mb-2">
                  Teléfono
                </label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rol" className="block text-sm font-bold text-gray-950 mb-2">
                  Rol del Usuario *
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                >
                  {allowedRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Roles disponibles según tus permisos
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-950 mb-2">
                  Contraseña Inicial *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Información importante:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• La contraseña debe tener al menos 6 caracteres</li>
                <li>• El usuario recibirá sus credenciales por email</li>
                <li>• Podrá cambiar su contraseña después del primer login</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 font-bold text-gray-950"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Creando...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
