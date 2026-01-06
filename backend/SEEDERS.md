# 🌱 Database Seeders

## Descripción

Los seeders permiten poblar la base de datos con datos de prueba para facilitar el desarrollo y testing de la aplicación.

## Datos incluidos

### Colegios (5 registros)
- Institución Educativa Distrital San José (Bogotá)
- Colegio Técnico Industrial (Medellín)
- Institución Educativa La Esperanza (Cali)
- Colegio Comercial Empresarial (Barranquilla)
- Institución Educativa Ciudad Jardín (Bogotá)

### Programas de Formación (8 registros)
- Tecnólogo en Análisis y Desarrollo de Software
- Técnico en Sistemas
- Tecnólogo en Contabilidad y Finanzas
- Técnico en Asistencia Administrativa
- Tecnólogo en Diseño Gráfico
- Técnico en Cocina
- Tecnólogo en Gestión Logística
- Técnico en Mantenimiento Electrónico

## Uso

### Ejecutar seeders

```bash
npm run seed
```

Este comando:
1. Se conecta a la base de datos
2. Crea los registros de prueba
3. Ignora registros duplicados (por NIT o código)
4. Muestra logs del proceso

### Verificar datos

Después de ejecutar los seeders, puedes verificar los datos en:

1. **Swagger UI**: http://localhost:3000/api/docs
   - GET `/api/colegios` - Ver todos los colegios
   - GET `/api/programas` - Ver todos los programas

2. **PgAdmin**: http://localhost:5050
   - Conectar a la base de datos
   - Explorar las tablas `colegios` y `programas`

3. **Usando curl o Postman**:
```bash
# Listar colegios
curl http://localhost:3000/api/colegios

# Listar programas
curl http://localhost:3000/api/programas
```

## Notas

- Los seeders verifican si los registros ya existen antes de crearlos
- Si un registro ya existe, se omite y continúa con el siguiente
- Los IDs se generan automáticamente como UUIDs
- Los seeders se pueden ejecutar múltiples veces sin duplicar datos
