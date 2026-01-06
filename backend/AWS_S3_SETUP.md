# Configuración de AWS S3 para Evidencias

Este módulo permite subir archivos (evidencias de justificación de inasistencias) a Amazon S3.

## Configuración de AWS (Capa Gratuita)

### 1. Crear cuenta de AWS
1. Ve a [https://aws.amazon.com](https://aws.amazon.com)
2. Haz clic en "Crear una cuenta de AWS"
3. Completa el registro (necesitas tarjeta de crédito, pero solo usarás la capa gratuita)

### 2. Crear un bucket de S3
1. Inicia sesión en la [Consola de AWS](https://console.aws.amazon.com)
2. Busca "S3" en el buscador
3. Haz clic en "Crear bucket"
4. Configura:
   - **Nombre del bucket**: `appsena-evidencias` (debe ser único globalmente)
   - **Región**: `us-east-1` (Norte de Virginia)
   - **Bloquear todo el acceso público**: DESMARCAR (necesitamos archivos públicos)
   - **Advertencia**: Acepta que los archivos serán públicos
5. Haz clic en "Crear bucket"

### 3. Configurar permisos del bucket
1. Abre el bucket creado
2. Ve a la pestaña "Permisos"
3. En "Política de bucket", agrega esta política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::appsena-evidencias/*"
        }
    ]
}
```

4. Guarda los cambios

### 4. Crear usuario IAM con permisos
1. En la consola de AWS, busca "IAM"
2. Ve a "Usuarios" → "Crear usuario"
3. Nombre: `appsena-uploader`
4. En permisos, selecciona "Adjuntar políticas directamente"
5. Busca y selecciona: `AmazonS3FullAccess`
6. Haz clic en "Crear usuario"

### 5. Generar credenciales de acceso
1. Abre el usuario creado
2. Ve a "Credenciales de seguridad"
3. Haz clic en "Crear clave de acceso"
4. Selecciona "Aplicación que se ejecuta fuera de AWS"
5. Descarga el archivo CSV con:
   - **Access Key ID**
   - **Secret Access Key**

### 6. Configurar variables de entorno

En el archivo `.env` del backend, agrega:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA****************
AWS_SECRET_ACCESS_KEY=********************************
AWS_S3_BUCKET_NAME=appsena-evidencias
```

## Uso del servicio

### Endpoint de upload

```
POST /api/upload/evidencia
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <archivo>
```

### Tipos de archivo permitidos
- PDF (.pdf)
- Imágenes: JPG, PNG, WEBP
- Documentos Word: DOC, DOCX

### Tamaño máximo
- 5 MB por archivo

### Respuesta exitosa

```json
{
  "url": "https://appsena-evidencias.s3.us-east-1.amazonaws.com/evidencias-asistencias/uuid.pdf",
  "key": "evidencias-asistencias/uuid.pdf"
}
```

## Costos (Capa Gratuita)

AWS S3 ofrece:
- **5 GB** de almacenamiento estándar
- **20,000** solicitudes GET
- **2,000** solicitudes PUT

Esto es **suficiente para el proyecto** y **completamente GRATIS** durante 12 meses.

## Seguridad

- Los archivos son públicos (necesario para mostrarlos en el frontend)
- Las credenciales de AWS están en variables de entorno (no en código)
- Solo usuarios autenticados pueden subir archivos
- Validación de tipos y tamaños de archivo

## Alternativa sin AWS (Desarrollo)

Si no quieres configurar AWS en desarrollo, puedes:
1. Guardar archivos localmente en `/public/uploads`
2. Retornar URLs locales: `http://localhost:3000/uploads/archivo.pdf`

Para esto, modifica `upload.service.ts` para detectar si hay credenciales de AWS configuradas.
