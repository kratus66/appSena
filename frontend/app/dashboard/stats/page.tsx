'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { PieChartCard } from '@/components/dashboard/pie-chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { TopFichaRiesgo } from '@/types/reportes';
import {
  Users,
  GraduationCap,
  FileText,
  School,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Download,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardInstructor } from '@/lib/reportes.api';
import api from '@/lib/api';

export default function StatsPage() {
  const [loading, setLoading] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = React.useState<string[]>([]);
  const [stats, setStats] = React.useState({
    totalAprendices: 0,
    aprendicesActivos: 0,
    suspendidos: 0,
    retirados: 0,
    desertores: 0,
    totalFichas: 0,
    fichasActivas: 0,
    tasaRetencion: 0,
    tasaDesercion: 0,
    totalSesiones: 0,
  });

  const [aprendicesPorPrograma, setAprendicesPorPrograma] = React.useState<any[]>([]);
  const [inscripcionesPorMes, setInscripcionesPorMes] = React.useState<any[]>([]);
  const [fichasPorColegio, setFichasPorColegio] = React.useState<any[]>([]);
  const [jornadaDistribucion, setJornadaDistribucion] = React.useState<any[]>([]);
  const [colegiosPorDepartamento, setColegiosPorDepartamento] = React.useState<any[]>([]);
  const [nivelFormacion, setNivelFormacion] = React.useState<any[]>([]);
  const [usuariosSistema, setUsuariosSistema] = React.useState<any>({
    administradores: 0,
    instructores: 0,
    coordinadores: 0,
    aprendices: 0,
  });
  const [dashboardData, setDashboardData] = React.useState<any>(null);

  React.useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Dashboard del instructor (datos reales del backend)
      const dashboardData = await getDashboardInstructor({ month: selectedYear + '-01' });
      
      // APIs adicionales para datos complementarios
      const [aprendices, fichas, programas, colegios, users] = await Promise.all([
        api.get('/aprendices?page=1&limit=1000'),
        api.get('/fichas?page=1&limit=1000'),
        api.get('/programas?page=1&limit=1000'),
        api.get('/colegios?page=1&limit=1000'),
        api.get('/users?page=1&limit=1000'),
      ]);

      const aprendicesData = aprendices.data.data || aprendices.data || [];
      const fichasData = fichas.data.data || fichas.data || [];
      const programasData = programas.data.data || programas.data || [];
      const colegiosData = colegios.data.data || colegios.data || [];
      const usersData = users.data.data || users.data || [];

      // Contar por estado académico
      const activos = aprendicesData.filter((a: any) => a.estadoAcademico === 'ACTIVO').length;
      const suspendidos = aprendicesData.filter((a: any) => a.estadoAcademico === 'SUSPENDIDO').length;
      const retirados = aprendicesData.filter((a: any) => a.estadoAcademico === 'RETIRADO').length;
      const desertores = aprendicesData.filter((a: any) => a.estadoAcademico === 'DESERTOR').length;

      const total = aprendices.data.total || 0;
      const fichasActivas = fichasData.filter((f: any) => f.estado === 'ACTIVA').length;

      // Calcular tasas
      const tasaRetencion = total > 0 ? ((activos / total) * 100).toFixed(1) : 0;
      const tasaRetirados = total > 0 ? ((retirados / total) * 100).toFixed(1) : 0;

      // Contar aprendices por programa
      const aprendicesPorProgramaMap: any = {};
      aprendicesData.forEach((aprendiz: any) => {
        if (aprendiz.ficha?.programa?.nombre) {
          const nombrePrograma = aprendiz.ficha.programa.nombre;
          if (aprendicesPorProgramaMap[nombrePrograma]) {
            aprendicesPorProgramaMap[nombrePrograma]++;
          } else {
            aprendicesPorProgramaMap[nombrePrograma] = 1;
          }
        }
      });

      const aprendicesPorProgramaArray = [...Object.entries(aprendicesPorProgramaMap)
        .map(([name, value]) => ({ name, value }))]
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 6);

      setAprendicesPorPrograma(aprendicesPorProgramaArray);

      // Contar inscripciones por año
      const inscripcionesPorAno: any = {};
      aprendicesData.forEach((aprendiz: any) => {
        if (aprendiz.createdAt) {
          const year = new Date(aprendiz.createdAt).getFullYear();
          inscripcionesPorAno[year] = (inscripcionesPorAno[year] || 0) + 1;
        }
      });

      // Solo mostrar años que tienen al menos 1 inscripción
      const yearsArray = Object.keys(inscripcionesPorAno)
        .filter(year => inscripcionesPorAno[year] > 0)
        .sort((a, b) => parseInt(b) - parseInt(a));
      
      setAvailableYears(yearsArray.length > 0 ? yearsArray : [new Date().getFullYear().toString()]);

      // Contar inscripciones por mes (año seleccionado)
      const mesesMap: any = {
        0: 'Ene', 1: 'Feb', 2: 'Mar', 3: 'Abr', 4: 'May', 5: 'Jun',
        6: 'Jul', 7: 'Ago', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
      };
      const inscripcionesPorMesMap: any = {};
      for (let i = 0; i < 12; i++) {
        inscripcionesPorMesMap[i] = 0;
      }

      aprendicesData.forEach((aprendiz: any) => {
        if (aprendiz.createdAt) {
          const fecha = new Date(aprendiz.createdAt);
          if (fecha.getFullYear() === parseInt(selectedYear)) {
            const mes = fecha.getMonth();
            inscripcionesPorMesMap[mes]++;
          }
        }
      });

      const inscripcionesPorMesArray = Object.entries(inscripcionesPorMesMap)
        .map(([mes, value]) => ({ name: mesesMap[parseInt(mes)], value }));

      setInscripcionesPorMes(inscripcionesPorMesArray);

      // Contar fichas por colegio
      const fichasPorColegioMap: any = {};
      fichasData.forEach((ficha: any) => {
        if (ficha.colegio?.nombre) {
          const nombreColegio = ficha.colegio.nombre;
          if (fichasPorColegioMap[nombreColegio]) {
            fichasPorColegioMap[nombreColegio]++;
          } else {
            fichasPorColegioMap[nombreColegio] = 1;
          }
        }
      });

      const fichasPorColegioArray = [...Object.entries(fichasPorColegioMap)
        .map(([name, value]) => ({ name, value }))]
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);

      setFichasPorColegio(fichasPorColegioArray);

      // Contar fichas por jornada
      const fichasPorJornadaMap: any = {};
      fichasData.forEach((ficha: any) => {
        if (ficha.jornada) {
          const jornada = ficha.jornada;
          if (fichasPorJornadaMap[jornada]) {
            fichasPorJornadaMap[jornada]++;
          } else {
            fichasPorJornadaMap[jornada] = 1;
          }
        }
      });

      const jornadaNombres: any = {
        'MADRUGADA': 'Madrugada',
        'MAÑANA': 'Mañana',
        'TARDE': 'Tarde',
        'NOCHE': 'Noche',
        'MIXTA': 'Mixta',
        'FINES_SEMANA': 'Fines de Semana'
      };

      const jornadaDistribucionArray = Object.entries(fichasPorJornadaMap)
        .map(([name, value]) => ({ name: jornadaNombres[name] || name, value }));

      setJornadaDistribucion(jornadaDistribucionArray);

      // Contar colegios por departamento
      const colegiosPorDepartamentoMap: any = {};
      colegiosData.forEach((colegio: any) => {
        if (colegio.departamento) {
          const dept = colegio.departamento;
          colegiosPorDepartamentoMap[dept] = (colegiosPorDepartamentoMap[dept] || 0) + 1;
        }
      });

      const colegiosPorDepartamentoArray = Object.entries(colegiosPorDepartamentoMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value);

      setColegiosPorDepartamento(colegiosPorDepartamentoArray);

      // Contar fichas por nivel de formación
      const nivelFormacionMap: any = {
        'TECNICO': 0,
        'TECNOLOGO': 0,
        'ESPECIALIZACION': 0,
      };
      
      fichasData.forEach((ficha: any) => {
        if (ficha.programa?.nivelFormacion) {
          const nivel = ficha.programa.nivelFormacion.toUpperCase();
          if (nivelFormacionMap[nivel] !== undefined) {
            nivelFormacionMap[nivel]++;
          } else {
            nivelFormacionMap[nivel] = 1;
          }
        }
      });

      const nivelFormacionArray = Object.entries(nivelFormacionMap)
        .map(([name, value]) => ({ name, value }));

      setNivelFormacion(nivelFormacionArray);

      // Contar usuarios por rol
      const rolesCount: any = {
        administradores: 0,
        instructores: 0,
        coordinadores: 0,
        aprendices: 0,
      };

      usersData.forEach((user: any) => {
        if (user.rol) {
          const rol = user.rol.toLowerCase();
          if (rol === 'admin') {
            rolesCount.administradores++;
          } else if (rol === 'instructor') {
            rolesCount.instructores++;
          } else if (rol === 'coordinador') {
            rolesCount.coordinadores++;
          } else if (rol === 'aprendiz') {
            rolesCount.aprendices++;
          }
        }
      });

      setUsuariosSistema(rolesCount);

      // Guardar datos del dashboard para usarlos en la UI
      setDashboardData(dashboardData);

      // Actualizar stats con datos del dashboard del instructor
      setStats({
        totalAprendices: dashboardData.totalAprendices,
        aprendicesActivos: activos,
        suspendidos,
        retirados,
        desertores,
        totalFichas: dashboardData.totalFichas,
        fichasActivas,
        tasaRetencion: dashboardData.tasaAsistenciaPromedio,
        tasaDesercion: Number(tasaRetirados),
        totalSesiones: dashboardData.totalSesiones,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const estadoAcademicoDetallado = [
    { name: 'Activos', value: stats.aprendicesActivos },
    { name: 'Suspendidos', value: stats.suspendidos },
    { name: 'Retirados', value: stats.retirados },
    { name: 'Desertores', value: stats.desertores },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700 font-medium">Cargando estadísticas...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas Avanzadas</h1>
            <p className="text-gray-700 mt-1 font-medium">
              Análisis detallado del sistema de gestión
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccione año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Aprendices"
            value={stats.totalAprendices}
            description="Total registrados"
            icon={GraduationCap}
            color="blue"
            trend={{ value: 15.3, isPositive: true }}
          />
          <StatsCard
            title="Fichas Activas"
            value={stats.fichasActivas}
            description="En formación"
            icon={FileText}
            color="green"
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Tasa de Retención"
            value={`${stats.tasaRetencion}%`}
            description="Aprendices activos"
            icon={TrendingUp}
            color="purple"
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatsCard
            title="Tasa de Retiro"
            value={`${stats.tasaDesercion}%`}
            description="Aprendices retirados"
            icon={TrendingDown}
            color="red"
            trend={{ value: 0.5, isPositive: false }}
          />
        </div>

        {/* KPIs Row 2 - Métricas adicionales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Sesiones"
            value={stats.totalSesiones}
            description="Sesiones programadas"
            icon={BookOpen}
            color="blue"
          />
          <StatsCard
            title="Alertas de Riesgo"
            value={dashboardData?.totalAlertasRiesgo || 0}
            description="Aprendices en riesgo"
            icon={AlertCircle}
            color="red"
          />
          <StatsCard
            title="Fichas en Riesgo"
            value={dashboardData?.topFichasRiesgo?.length || 0}
            description="Con alertas activas"
            icon={AlertTriangle}
            color="orange"
          />
          <StatsCard
            title="Asistencia Promedio"
            value={`${dashboardData?.tasaAsistenciaPromedio || 0}%`}
            description="Tasa global"
            icon={TrendingUp}
            color="green"
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-gray-900">
                Inscripciones por Mes ({selectedYear})
              </CardTitle>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {inscripcionesPorMes.some((item) => item.value > 0) ? (
                  <BarChart data={inscripcionesPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                    No hay datos para {selectedYear}
                  </div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
              <CardTitle className="text-gray-900 font-bold">Top 5 Programas Más Demandados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...aprendicesPorPrograma]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((programa, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{programa.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(programa.value / 85) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
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
              <CardTitle className="text-base text-gray-900 font-bold">Colegios por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {colegiosPorDepartamento.length > 0 ? (
                  colegiosPorDepartamento.slice(0, 5).map((dept, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-800 font-medium">{dept.name}</span>
                      <span className="font-bold text-gray-900">{dept.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 font-medium">No hay datos disponibles</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 font-bold">Nivel de Formación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nivelFormacion.length > 0 ? (
                  nivelFormacion.map((nivel, index) => {
                    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-800 font-medium">{nivel.name}</span>
                        <span className={`font-bold ${color}`}>{nivel.value} fichas</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 font-medium">No hay datos disponibles</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 font-bold">Usuarios del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-800 font-medium">Administradores</span>
                  </div>
                  <span className="font-bold text-gray-900">{usuariosSistema.administradores}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-800 font-medium">Instructores</span>
                  </div>
                  <span className="font-bold text-gray-900">{usuariosSistema.instructores}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-800 font-medium">Coordinadores</span>
                  </div>
                  <span className="font-bold text-gray-900">{usuariosSistema.coordinadores}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-800 font-medium">Aprendices</span>
                  </div>
                  <span className="font-bold text-gray-900">{usuariosSistema.aprendices}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Riesgo */}
        {dashboardData && dashboardData.totalAlertasRiesgo > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                Alertas de Riesgo ({dashboardData.totalAlertasRiesgo})
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.topFichasRiesgo.map((ficha: TopFichaRiesgo) => (
                <Card key={ficha.fichaId} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-gray-900 font-bold flex items-center justify-between">
                      <span>{ficha.numeroFicha}</span>
                      <span className="text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded">
                        {ficha.totalAlertas} alertas
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Programa:</span>
                        <span className="text-gray-900 font-bold truncate ml-2">{ficha.programa}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
