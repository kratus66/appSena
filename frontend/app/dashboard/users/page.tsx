'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Users as UsersIcon,
  Shield,
  Mail,
  Phone,
  AlertCircle,
  GraduationCap,
  UserCog,
  CheckCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { User, UserRole } from '@/types';
import { CreateUserModal } from '@/components/users/create-user-modal';
import { ViewUserModal } from '@/components/users/view-user-modal';
import { EditUserModal } from '@/components/users/edit-user-modal';

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [rolFilter, setRolFilter] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = React.useState<UserRole>('admin');

  React.useEffect(() => {
    fetchUsers();
    loadCurrentUserRole();
  }, [currentPage, searchTerm]); // Remover rolFilter del useEffect

  const loadCurrentUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.rol || 'admin');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 100 }; // Traer más usuarios para filtrar localmente
      if (searchTerm) params.search = searchTerm;
      // No enviar rolFilter al backend, filtraremos localmente

      console.log('Fetching users with params:', params);
      const response = await api.get('/users', { params });
      console.log('Users response:', response.data);
      
      // El backend puede devolver un array directamente o un objeto con data
      let usersData;
      if (Array.isArray(response.data)) {
        // Si es un array directamente
        usersData = response.data;
        setUsers(usersData);
        setTotalPages(Math.ceil(usersData.length / 10));
      } else if (response.data.data) {
        // Si tiene estructura { data: [], total: X }
        usersData = response.data.data;
        setUsers(Array.isArray(usersData) ? usersData : []);
        const total = response.data.total || usersData.length || 0;
        const limit = response.data.limit || 10;
        setTotalPages(Math.ceil(total / limit));
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/users/${selectedUser.id}`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

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

  // Filtrar usuarios localmente
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!rolFilter) return users;
    return users.filter((user) => user.rol === rolFilter);
  }, [users, rolFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">Gestiona los usuarios del sistema</p>
          </div>
          <Button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            <span>Nuevo Usuario</span>
          </Button>
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchUsers();
          }}
          currentUserRole={currentUserRole}
        />

        {/* View User Modal */}
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />

        {/* Edit User Modal */}
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
          }}
          user={selectedUser}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="mr-2" />
                  Confirmar Eliminación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar al usuario{' '}
                  <strong>{selectedUser.nombre}</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 font-bold text-gray-950"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDeleteUser}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, email o documento..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 font-medium"
                value={rolFilter}
                onChange={(e) => setRolFilter(e.target.value)}
              >
                <option value="">Todos los roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="coordinador">Coordinador</option>
                <option value="aprendiz">Aprendiz</option>
                <option value="acudiente">Acudiente</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${rolFilter === '' ? 'ring-2 ring-gray-400 shadow-md' : ''}`}
            onClick={() => setRolFilter('')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-gray-700" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${rolFilter === 'admin' ? 'ring-2 ring-red-400 shadow-md' : ''}`}
            onClick={() => setRolFilter('admin')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Admins</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users?.filter((u) => u.rol === 'admin').length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${rolFilter === 'instructor' ? 'ring-2 ring-blue-400 shadow-md' : ''}`}
            onClick={() => setRolFilter('instructor')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Instructores</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users?.filter((u) => u.rol === 'instructor').length || 0}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${rolFilter === 'coordinador' ? 'ring-2 ring-purple-400 shadow-md' : ''}`}
            onClick={() => setRolFilter('coordinador')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Coordinadores</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users?.filter((u) => u.rol === 'coordinador').length || 0}
                  </p>
                </div>
                <UserCog className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${rolFilter === 'aprendiz' ? 'ring-2 ring-green-400 shadow-md' : ''}`}
            onClick={() => setRolFilter('aprendiz')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprendices</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users?.filter((u) => u.rol === 'aprendiz').length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Documento</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Contacto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-700 font-semibold">
                                  {user.nombre.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{user.nombre}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-gray-900 font-semibold">{user.documento}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {user.telefono && (
                              <div className="flex items-center text-gray-600">
                                <Phone size={14} className="mr-1" />
                                {user.telefono}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getRolBadge(user.rol)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={user.activo ? 'success' : 'default'}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-gray-500">
                <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {rolFilter ? `No hay usuarios con rol ${rolFilter}` : 'No hay usuarios'}
                </p>
                <p className="text-sm">
                  {rolFilter ? 'Intenta con otro filtro' : 'Comienza creando tu primer usuario'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
