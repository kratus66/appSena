'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, AlertCircle, Save } from 'lucide-react';
import api from '@/lib/api';
import { User, UserRole, DependenciaInstructor, EstadoDisponibilidad } from '@/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

const DEPENDENCIAS: DependenciaInstructor[] = ['Articulacion', 'Titulada', 'Complementaria'];
const ESTADOS: EstadoDisponibilidad[] = ['Disponible', 'Parcial', 'Saturado'];

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = React.useState({
    nombre: '',
    email: '',
    documento: '',
    telefono: '',
    // Instructor profile
    profesion: '',
    dependencia: '' as DependenciaInstructor | '',
    area: '',
    tipoPrograma: '',
    sede: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
    colegioArticulacion: '',
    modalidadArticulacion: '',
    jornadaArticulacion: '',
    localidad: '',
    estadoDisponibilidad: '' as EstadoDisponibilidad | '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        documento: user.documento || '',
        telefono: user.telefono || '',
        profesion: user.profesion || '',
        dependencia: user.dependencia || '',
        area: user.area || '',
        tipoPrograma: user.tipoPrograma || '',
        sede: user.sede || '',
        fechaInicioContrato: user.fechaInicioContrato || '',
        fechaFinContrato: user.fechaFinContrato || '',
        colegioArticulacion: user.colegioArticulacion || '',
        modalidadArticulacion: user.modalidadArticulacion || '',
        jornadaArticulacion: user.jornadaArticulacion || '',
        localidad: user.localidad || '',
        estadoDisponibilidad: user.estadoDisponibilidad || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.email || !formData.documento) {
      setError('Por favor completa todos los campos obligatorios');
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
    if (!validateForm() || !user) return;
    setLoading(true);
    try {
      // Strip empty string fields before sending
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v !== '') payload[k] = v;
      }
      await api.patch(`/users/${user.id}`, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        setError(errorMessage.join(', '));
      } else {
        setError(errorMessage || 'Error al actualizar el usuario. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const isInstructor = user.rol === 'instructor';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-950">Editar Usuario</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Actualiza la información del usuario
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

            {/* Basic fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-bold text-gray-950 mb-2">
                  Nombre Completo *
                </label>
                <Input id="nombre" name="nombre" type="text" placeholder="Ej: Juan Pérez"
                  value={formData.nombre} onChange={handleChange} disabled={loading} required />
              </div>
              <div>
                <label htmlFor="documento" className="block text-sm font-bold text-gray-950 mb-2">
                  Documento *
                </label>
                <Input id="documento" name="documento" type="text" placeholder="Ej: 1234567890"
                  value={formData.documento} onChange={handleChange} disabled={loading} required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-950 mb-2">
                  Email *
                </label>
                <Input id="email" name="email" type="email" placeholder="ejemplo@sena.edu.co"
                  value={formData.email} onChange={handleChange} disabled={loading} required />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-bold text-gray-950 mb-2">
                  Teléfono
                </label>
                <Input id="telefono" name="telefono" type="tel" placeholder="Ej: 3001234567"
                  value={formData.telefono} onChange={handleChange} disabled={loading} />
              </div>
            </div>

            {/* Instructor profile fields */}
            {isInstructor && (
              <>
                <hr className="border-gray-100" />
                <p className="text-sm font-bold text-gray-700 pb-1">Perfil de instructor</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profesion" className="block text-sm font-bold text-gray-950 mb-2">
                      Profesión
                    </label>
                    <Input id="profesion" name="profesion" type="text" placeholder="Ej: Ingeniero de Sistemas"
                      value={formData.profesion} onChange={handleChange} disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="dependencia" className="block text-sm font-bold text-gray-950 mb-2">
                      Dependencia
                    </label>
                    <select id="dependencia" name="dependencia" value={formData.dependencia}
                      onChange={handleChange} disabled={loading}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option value="">Seleccionar...</option>
                      {DEPENDENCIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="area" className="block text-sm font-bold text-gray-950 mb-2">
                      Área
                    </label>
                    <Input id="area" name="area" type="text" placeholder="Ej: Tecnología e Informática"
                      value={formData.area} onChange={handleChange} disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="tipoPrograma" className="block text-sm font-bold text-gray-950 mb-2">
                      Tipo de programa
                    </label>
                    <Input id="tipoPrograma" name="tipoPrograma" type="text" placeholder="Ej: Tecnólogo"
                      value={formData.tipoPrograma} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sede" className="block text-sm font-bold text-gray-950 mb-2">
                      Sede
                    </label>
                    <Input id="sede" name="sede" type="text" placeholder="Ej: Chapinero"
                      value={formData.sede} onChange={handleChange} disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="localidad" className="block text-sm font-bold text-gray-950 mb-2">
                      Localidad
                    </label>
                    <Input id="localidad" name="localidad" type="text" placeholder="Ej: Chapinero"
                      value={formData.localidad} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fechaInicioContrato" className="block text-sm font-bold text-gray-950 mb-2">
                      Inicio contrato
                    </label>
                    <Input id="fechaInicioContrato" name="fechaInicioContrato" type="date"
                      value={formData.fechaInicioContrato} onChange={handleChange} disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="fechaFinContrato" className="block text-sm font-bold text-gray-950 mb-2">
                      Fin contrato
                    </label>
                    <Input id="fechaFinContrato" name="fechaFinContrato" type="date"
                      value={formData.fechaFinContrato} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estadoDisponibilidad" className="block text-sm font-bold text-gray-950 mb-2">
                      Estado de disponibilidad
                    </label>
                    <select id="estadoDisponibilidad" name="estadoDisponibilidad"
                      value={formData.estadoDisponibilidad} onChange={handleChange} disabled={loading}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option value="">Seleccionar...</option>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                {/* Articulation fields (only show if dependencia is selected as Articulacion) */}
                {formData.dependencia === 'Articulacion' && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 pt-1">
                      Datos de articulación
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="colegioArticulacion" className="block text-sm font-bold text-gray-950 mb-2">
                          Colegio base
                        </label>
                        <Input id="colegioArticulacion" name="colegioArticulacion" type="text"
                          placeholder="Ej: IED La Candelaria"
                          value={formData.colegioArticulacion} onChange={handleChange} disabled={loading} />
                      </div>
                      <div>
                        <label htmlFor="modalidadArticulacion" className="block text-sm font-bold text-gray-950 mb-2">
                          Modalidad
                        </label>
                        <select id="modalidadArticulacion" name="modalidadArticulacion"
                          value={formData.modalidadArticulacion} onChange={handleChange} disabled={loading}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600">
                          <option value="">Seleccionar...</option>
                          <option value="Compartida">Compartida</option>
                          <option value="Unica">Única</option>
                          <option value="Colegio privado">Colegio privado</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="jornadaArticulacion" className="block text-sm font-bold text-gray-950 mb-2">
                          Jornada
                        </label>
                        <select id="jornadaArticulacion" name="jornadaArticulacion"
                          value={formData.jornadaArticulacion} onChange={handleChange} disabled={loading}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600">
                          <option value="">Seleccionar...</option>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Información:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• El rol del usuario no puede ser modificado desde aquí</li>
                <li>• Para cambiar la contraseña, contacta al administrador</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}
                className="flex-1 font-bold text-gray-950">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                <Save size={16} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
