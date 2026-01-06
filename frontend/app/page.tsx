'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  Users,
  FileText,
  BarChart3,
  School,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Award,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">AS</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AppSena</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700">Registrarse</Button>
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
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Sistema de Gestión Educativa
                <span className="block text-green-600 mt-2">SENA</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Plataforma integral para la administración de aprendices, fichas, colegios y programas de formación del SENA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    Comenzar Ahora
                    <ArrowRight className="ml-2" size={20} />
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
                <div className="absolute inset-0 bg-green-600 rounded-2xl transform rotate-3"></div>
                <Card className="relative transform -rotate-1 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <GraduationCap className="text-green-600 mb-2" size={32} />
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                        <p className="text-sm text-gray-600">Aprendices</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <FileText className="text-blue-600 mb-2" size={32} />
                        <p className="text-2xl font-bold text-gray-900">45</p>
                        <p className="text-sm text-gray-600">Fichas Activas</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <School className="text-purple-600 mb-2" size={32} />
                        <p className="text-2xl font-bold text-gray-900">28</p>
                        <p className="text-sm text-gray-600">Colegios</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <BookOpen className="text-orange-600 mb-2" size={32} />
                        <p className="text-2xl font-bold text-gray-900">15</p>
                        <p className="text-sm text-gray-600">Programas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para gestionar tu institución educativa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gestión de Aprendices
                </h3>
                <p className="text-gray-600">
                  Administra la información completa de aprendices, seguimiento académico y documentación.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Control de Fichas
                </h3>
                <p className="text-gray-600">
                  Organiza fichas de formación por jornada, estado y programa académico.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <School className="text-purple-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Colegios Asociados
                </h3>
                <p className="text-gray-600">
                  Gestiona instituciones educativas asociadas con toda su información de contacto.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="text-orange-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Programas de Formación
                </h3>
                <p className="text-gray-600">
                  Administra programas técnicos, tecnológicos y especializaciones.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gestión de Usuarios
                </h3>
                <p className="text-gray-600">
                  Control de roles: administradores, instructores, coordinadores y más.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Reportes y Estadísticas
                </h3>
                <p className="text-gray-600">
                  Visualiza datos importantes con gráficos interactivos y reportes detallados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
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
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Seguro y Confiable</h3>
              <p className="text-green-100">
                Autenticación robusta y protección de datos sensibles.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rápido y Eficiente</h3>
              <p className="text-green-100">
                Interfaz intuitiva que optimiza tus procesos administrativos.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-green-600" size={32} />
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
              <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
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
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">AS</span>
                </div>
                <span className="ml-3 text-xl font-bold">AppSena</span>
              </div>
              <p className="text-gray-400">
                Sistema de gestión educativa para el SENA
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Funcionalidades</Link></li>
                <li><Link href="#" className="hover:text-white">Precios</Link></li>
                <li><Link href="#" className="hover:text-white">Documentación</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Compañía</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white">Términos</Link></li>
                <li><Link href="#" className="hover:text-white">Cookies</Link></li>
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
