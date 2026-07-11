import Link from 'next/link';

export const metadata = {
  title: 'Política de Tratamiento de Datos — AppSena',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">AS</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AppSena</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-md text-sm">
          <strong>Borrador pendiente de revisión legal.</strong> Este texto es una plantilla
          técnica de referencia (estructura sugerida por la Ley 1581 de 2012 y el Decreto 1377
          de 2013 de Colombia) y <strong>no debe publicarse a clientes reales</strong> sin que un
          abogado la revise y la adapte a la operación concreta de la institución.
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Política de Tratamiento de Datos Personales
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Responsable del tratamiento</h2>
            <p>
              [Completar: razón social, NIT, dirección y datos de contacto de la institución que
              opera AppSena.]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Datos que se recopilan</h2>
            <p>
              El sistema trata datos de instructores, coordinadores, aprendices y acudientes:
              nombres, documento de identidad, contacto, información académica (fichas,
              asistencias, procesos disciplinarios, planes de mejoramiento) y, cuando aplica,
              datos de menores de edad en programas de articulación con colegios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Finalidad del tratamiento</h2>
            <p>
              Gestión académica y administrativa de instructores, fichas de formación y
              aprendices: registro de asistencia, seguimiento disciplinario, planes de
              mejoramiento y reportes institucionales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Derechos del titular (ARCO)
            </h2>
            <p>
              Todo titular de datos personales puede solicitar acceso, corrección, actualización
              y supresión de sus datos, así como revocar la autorización otorgada, mediante
              [completar: canal de contacto].
            </p>
            <p>
              El acceso a los datos propios también está disponible directamente en el sistema:
              cualquier usuario autenticado puede consultar su perfil en{' '}
              <code>GET /api/users/me</code>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Datos de menores de edad</h2>
            <p>
              [Completar con acompañamiento legal: tratamiento específico para aprendices menores
              de edad en programas de articulación — representación de padres/acudientes,
              interés superior del menor, carácter no comercial del tratamiento.]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Seguridad de la información</h2>
            <p>
              El sistema aplica autenticación por sesión, control de acceso por rol y por
              institución, y cifrado de contraseñas. El detalle técnico de seguridad se mantiene
              en <code>docs/PRODUCTION_READINESS.md</code> del repositorio del proyecto.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
