'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { PieChartCard } from '@/components/dashboard/pie-chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  FileText,
  School,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalAprendices: 0,
    aprendicesActivos: 0,
    totalFichas: 0,
    fichasActivas: 0,
    totalColegios: 0,
    totalUsuarios: 0,
    suspendidos: 0,
    retirados: 0,
    desertores: 0,
  });

  const [fichasPorPrograma, setFichasPorPrograma] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [aprendices, fichas, colegios, users, programas] = await Promise.all([
        api.get('/aprendices?page=1&limit=1000'),
        api.get('/fichas?page=1&limit=1000'),
        api.get('/colegios?page=1&limit=1000'),
        api.get('/users?page=1&limit=1000'),
        api.get('/programas?page=1&limit=1000'),
      ]);

      // Contar aprendices por estado académico
      const aprendicesData = aprendices.data.data || [];
      const aprendicesActivos = aprendicesData.filter(
        (a: any) => a.estadoAcademico === 'ACTIVO'
      ).length;
      const suspendidos = aprendicesData.filter(
        (a: any) => a.estadoAcademico === 'SUSPENDIDO'
      ).length;
      const retirados = aprendicesData.filter(
        (a: any) => a.estadoAcademico === 'RETIRADO'
      ).length;
      const desertores = aprendicesData.filter(
        (a: any) => a.estadoAcademico === 'DESERTOR'
      ).length;

      // Contar fichas activas
      const fichasData = fichas.data.data || [];
      const fichasActivas = fichasData.filter(
        (f: any) => f.estado === 'ACTIVA'
      ).length;

      // Contar fichas por programa
      const programasData = programas.data.data || [];
      const fichasPorProgramaMap: any = {};
      
      fichasData.forEach((ficha: any) => {
        if (ficha.programa && ficha.programa.nombre) {
          const nombrePrograma = ficha.programa.nombre;
          if (fichasPorProgramaMap[nombrePrograma]) {
            fichasPorProgramaMap[nombrePrograma]++;
          } else {
            fichasPorProgramaMap[nombrePrograma] = 1;
          }
        }
      });

      // Convertir a array para el gráfico
      const fichasPorProgramaArray = Object.entries(fichasPorProgramaMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5); // Top 5 programas

      setFichasPorPrograma(fichasPorProgramaArray);

      setStats({
        totalAprendices: aprendices.data.total || 0,
        aprendicesActivos: aprendicesActivos,
        totalFichas: fichas.data.total || 0,
        fichasActivas: fichasActivas,
        totalColegios: colegios.data.total || 0,
        totalUsuarios: users.data.total || 0,
        suspendidos: suspendidos,
        retirados: retirados,
        desertores: desertores,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprendicesPorMes = [
    { name: 'Ene', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 61 },
    { name: 'Abr', value: 58 },
    { name: 'May', value: 70 },
    { name: 'Jun', value: 75 },
  ];

  const estadoAcademico = [
    { name: 'Activos', value: stats.aprendicesActivos },
    { name: 'Suspendidos', value: stats.suspendidos },
    { name: 'Retirados', value: stats.retirados },
    { name: 'Desertores', value: stats.desertores },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al sistema de gestión AppSena</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Aprendices"
            value={stats.totalAprendices}
            description="Aprendices registrados"
            icon={GraduationCap}
            color="blue"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Fichas Activas"
            value={stats.fichasActivas}
            description="Fichas en curso"
            icon={FileText}
            color="green"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Colegios"
            value={stats.totalColegios}
            description="Instituciones aliadas"
            icon={School}
            color="purple"
          />
          <StatsCard
            title="Usuarios"
            value={stats.totalUsuarios}
            description="Usuarios del sistema"
            icon={Users}
            color="orange"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Nuevos Aprendices por Mes"
            data={aprendicesPorMes}
            dataKey="value"
            color="#10b981"
          />
          <PieChartCard
            title="Estado Académico de Aprendices"
            data={estadoAcademico}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Fichas por Programa"
            data={fichasPorPrograma}
            dataKey="value"
            color="#3b82f6"
          />

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: 'Nuevo aprendiz registrado',
                    detail: 'Juan Pérez - Ficha 2654320',
                    time: 'Hace 2 horas',
                    type: 'success',
                  },
                  {
                    action: 'Ficha actualizada',
                    detail: 'Ficha 2654321 - Estado: Activa',
                    time: 'Hace 5 horas',
                    type: 'info',
                  },
                  {
                    action: 'Aprendiz suspendido',
                    detail: 'María González - Ficha 2654322',
                    time: 'Hace 1 día',
                    type: 'warning',
                  },
                  {
                    action: 'Nueva ficha creada',
                    detail: 'Ficha 2654323 - Programa: Sistemas',
                    time: 'Hace 2 días',
                    type: 'success',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                    <div className="mt-1">
                      {activity.type === 'success' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {activity.type === 'info' && <FileText className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'warning' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.detail}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Aprendices Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.aprendicesActivos}</p>
                </div>
                <Badge variant="success">Activos</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Fichas en Curso</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.fichasActivas}</p>
                </div>
                <Badge variant="info">En Curso</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Colegios Activos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalColegios}</p>
                </div>
                <Badge variant="default">Total</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
