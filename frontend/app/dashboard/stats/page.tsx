'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { PieChartCard } from '@/components/dashboard/pie-chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  FileText,
  School,
  TrendingUp,
  TrendingDown,
  BookOpen,
} from 'lucide-react';

export default function StatsPage() {
  const aprendicesPorPrograma = [
    { name: 'Desarrollo de Software', value: 85 },
    { name: 'Cocina', value: 62 },
    { name: 'Electricidad', value: 48 },
    { name: 'Mecánica Automotriz', value: 55 },
    { name: 'Contabilidad', value: 41 },
    { name: 'Enfermería', value: 73 },
  ];

  const fichasPorColegio = [
    { name: 'IE La Esperanza', value: 12 },
    { name: 'Colegio San José', value: 8 },
    { name: 'IE Técnico Industrial', value: 15 },
    { name: 'Colegio Santa María', value: 6 },
    { name: 'IE Nacional', value: 10 },
  ];

  const estadoAcademicoDetallado = [
    { name: 'Activos', value: 245 },
    { name: 'Suspendidos', value: 12 },
    { name: 'Retirados', value: 8 },
    { name: 'Desertores', value: 5 },
  ];

  const jornadaDistribucion = [
    { name: 'Mañana', value: 95 },
    { name: 'Tarde', value: 87 },
    { name: 'Noche', value: 63 },
    { name: 'Fines de Semana', value: 25 },
  ];

  const inscripcionesPorMes = [
    { name: 'Ene', value: 15 },
    { name: 'Feb', value: 28 },
    { name: 'Mar', value: 42 },
    { name: 'Abr', value: 38 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: 48 },
    { name: 'Jul', value: 35 },
    { name: 'Ago', value: 52 },
    { name: 'Sep', value: 45 },
    { name: 'Oct', value: 58 },
    { name: 'Nov', value: 42 },
    { name: 'Dic', value: 32 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas Avanzadas</h1>
          <p className="text-gray-500 mt-1">
            Análisis detallado del sistema de gestión
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Aprendices"
            value="270"
            description="Total registrados"
            icon={GraduationCap}
            color="blue"
            trend={{ value: 15.3, isPositive: true }}
          />
          <StatsCard
            title="Fichas Activas"
            value="51"
            description="En formación"
            icon={FileText}
            color="green"
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Tasa de Retención"
            value="90.7%"
            description="Aprendices activos"
            icon={TrendingUp}
            color="purple"
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatsCard
            title="Tasa de Deserción"
            value="1.9%"
            description="Aprendices desertores"
            icon={TrendingDown}
            color="red"
            trend={{ value: 0.5, isPositive: false }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Aprendices por Programa de Formación"
            data={aprendicesPorPrograma}
            dataKey="value"
            color="#3b82f6"
          />
          <ChartCard
            title="Inscripciones por Mes (2025)"
            data={inscripcionesPorMes}
            dataKey="value"
            color="#10b981"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PieChartCard
            title="Estado Académico de Aprendices"
            data={estadoAcademicoDetallado}
          />
          <PieChartCard
            title="Distribución por Jornada"
            data={jornadaDistribucion}
            colors={['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']}
          />
        </div>

        {/* Charts Row 3 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Fichas por Colegio"
            data={fichasPorColegio}
            dataKey="value"
            color="#8b5cf6"
          />

          {/* Top Programas */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Programas Más Demandados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aprendicesPorPrograma
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((programa, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{programa.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(programa.value / 85) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                          {programa.value}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colegios por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Valle del Cauca</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cundinamarca</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Antioquia</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Atlántico</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Otros</span>
                  <span className="font-bold">9</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nivel de Formación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Técnico</span>
                  <span className="font-bold text-blue-600">32 fichas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tecnólogo</span>
                  <span className="font-bold text-green-600">15 fichas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Especialización</span>
                  <span className="font-bold text-purple-600">4 fichas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuarios del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Administradores</span>
                  </div>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Instructores</span>
                  </div>
                  <span className="font-bold">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Coordinadores</span>
                  </div>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Aprendices</span>
                  </div>
                  <span className="font-bold">270</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
