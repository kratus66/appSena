'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo, LogoMark } from '@/components/ui/logo';
import {
  GraduationCap,
  FileText,
  BarChart3,
  School,
  ClipboardCheck,
  ArrowRight,
  Shield,
  Zap,
  Award,
  CalendarDays,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size={40} />
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Hecho para instructores del SENA
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 text-balance">
                Toda tu gestión de formación
                <span className="block text-brand-600 mt-2">en un solo lugar</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
                Fichas, aprendices, asistencias, proceso disciplinario, PTC y planes de
                mejoramiento. Menos papeleo y hojas de cálculo, más tiempo para formar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comenzar Ahora
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500 rounded-2xl transform rotate-3"></div>
                <Card className="relative transform -rotate-1 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                      <LogoMark size={40} />
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">Panel del instructor</p>
                        <p className="text-sm text-gray-500">Todo tu día, de un vistazo</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: ClipboardCheck, label: 'Asistencia de hoy', value: 'Registrar', tint: 'text-brand-600 bg-brand-50' },
                        { icon: Shield, label: 'Casos disciplinarios', value: '2 abiertos', tint: 'text-orange-600 bg-orange-50' },
                        { icon: FileText, label: 'PTC por revisar', value: '3', tint: 'text-blue-600 bg-blue-50' },
                        { icon: CalendarDays, label: 'Próxima sesión', value: '8:00 a. m.', tint: 'text-purple-600 bg-purple-50' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${row.tint}`}>
                            <row.icon size={18} />
                          </span>
                          <span className="text-sm font-medium text-gray-700 flex-1">{row.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Los procesos del SENA, resueltos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No es un CRM genérico: cada módulo está pensado para el día a día de un instructor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, tint: 'bg-brand-50 text-brand-600', title: 'Aprendices y fichas', desc: 'Información completa de aprendices, fichas por jornada, estado y programa, con seguimiento académico.' },
              { icon: ClipboardCheck, tint: 'bg-blue-50 text-blue-600', title: 'Asistencias', desc: 'Registra sesiones, controla la asistencia y justifica inasistencias con soporte de evidencias.' },
              { icon: Shield, tint: 'bg-orange-50 text-orange-600', title: 'Proceso disciplinario', desc: 'Abre y da trazabilidad a los casos disciplinarios con su historial y estados.' },
              { icon: FileText, tint: 'bg-purple-50 text-purple-600', title: 'PTC y actas', desc: 'Planes de Trabajo Concertado con sus ítems, actas y seguimiento en un flujo claro.' },
              { icon: School, tint: 'bg-rose-50 text-rose-600', title: 'Colegios y programas', desc: 'Gestiona instituciones aliadas y los programas técnicos y tecnológicos asociados.' },
              { icon: BarChart3, tint: 'bg-amber-50 text-amber-600', title: 'Reportes y estadísticas', desc: 'Indicadores y gráficos para entender tus fichas y aprendices de un vistazo.' },
            ].map((f, i) => (
              <Card key={i} className="hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.tint}`}>
                    <f.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Por qué AppSena?</h2>
            <p className="text-xl text-green-100">
              La solución completa para instituciones educativas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-brand-700" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Seguro y Confiable</h3>
              <p className="text-green-100">
                Autenticación robusta y protección de datos sensibles.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-brand-700" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rápido y Eficiente</h3>
              <p className="text-green-100">
                Interfaz intuitiva que optimiza tus procesos administrativos.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-brand-700" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Calidad Garantizada</h3>
              <p className="text-green-100">
                Desarrollado siguiendo las mejores prácticas de la industria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a AppSena y transforma la gestión de tu institución educativa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size={40} light className="mb-4" />
              <p className="text-gray-400 max-w-xs">
                Sistema de gestión para instructores del SENA: fichas, aprendices, asistencias y más.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Acceso</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Panel</Link></li>
                <li><Link href="/dashboard/asistencias" className="hover:text-white transition-colors">Asistencias</Link></li>
                <li><Link href="/dashboard/ptc" className="hover:text-white transition-colors">PTC</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:soporte@appsena.co" className="hover:text-white transition-colors">soporte@appsena.co</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 AppSena. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
