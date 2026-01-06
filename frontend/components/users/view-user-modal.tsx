'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Mail, Phone, IdCard, Calendar, CheckCircle } from 'lucide-react';
import { User } from '@/types';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const getRolBadge = (rol: string) => {
    const variants: any = {
      admin: 'danger',
      instructor: 'success',
      coordinador: 'warning',
      aprendiz: 'info',
      acudiente: 'default',
    };
    const labels: any = {
      admin: 'Admin',
      instructor: 'Instructor',
      coordinador: 'Coordinador',
      aprendiz: 'Aprendiz',
      acudiente: 'Acudiente',
    };
    return <Badge variant={variants[rol] || 'default'}>{labels[rol] || rol}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Detalles del Usuario</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar y nombre */}
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-700">
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.nombre}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRolBadge(user.rol)}
                  <Badge variant={user.activo ? 'success' : 'default'}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <IdCard className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Documento</p>
                      <p className="font-medium">{user.documento}</p>
                    </div>
                  </div>
                  {user.telefono && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-medium">{user.telefono}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Sistema</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Creación</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Última Actualización</p>
                      <p className="font-medium">
                        {new Date(user.updatedAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
                Cerrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
