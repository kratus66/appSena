import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private region: string;
  private useLocalStorage: boolean;
  private uploadDir: string;

  constructor() {
    // Configuración de AWS S3
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'appsena-evidencias';
    
    // Verificar si las credenciales de AWS están configuradas
    const awsConfigured = 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_ACCESS_KEY_ID !== 'PENDIENTE_CONFIGURAR' &&
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_SECRET_ACCESS_KEY !== 'PENDIENTE_CONFIGURAR';

    this.useLocalStorage = !awsConfigured;

    if (this.useLocalStorage) {
      // Modo desarrollo: usar almacenamiento local
      this.uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      this.logger.warn('⚠️  AWS no configurado. Usando almacenamiento local en: ' + this.uploadDir);
    } else {
      // Modo producción: usar AWS S3
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      this.logger.log('✅ AWS S3 configurado correctamente');
    }
  }

  /**
   * Sube un archivo a S3 o almacenamiento local
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'evidencias-asistencias',
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo (solo documentos e imágenes)
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se permiten PDF, imágenes (JPG, PNG, WEBP) y documentos Word.',
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe superar los 5MB');
    }

    // Generar nombre único para el archivo
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    if (this.useLocalStorage) {
      // Modo desarrollo: guardar localmente
      return this.saveFileLocally(file, fileName);
    } else {
      // Modo producción: subir a S3
      return this.uploadToS3(file, fileName);
    }
  }

  /**
   * Guarda archivo en almacenamiento local
   */
  private async saveFileLocally(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      const fileDir = path.dirname(filePath);

      // Crear directorio si no existe
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Guardar archivo
      fs.writeFileSync(filePath, file.buffer);

      // URL local (asumiendo que el backend sirve archivos estáticos desde /uploads)
      const url = `http://localhost:3000/uploads/${fileName.replace(/\\/g, '/')}`;

      this.logger.log(`✅ Archivo guardado localmente: ${filePath}`);

      return { url, key: fileName };
    } catch (error) {
      this.logger.error(`❌ Error al guardar archivo localmente: ${error.message}`);
      throw new BadRequestException('Error al guardar el archivo');
    }
  }

  /**
   * Sube archivo a AWS S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<{ url: string; key: string }> {
    try {
      // Comando para subir a S3 (sin ACL - usar configuración del bucket)
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client!.send(command);

      // Generar URL firmada válida por 7 días
      const url = await this.getSignedUrl(fileName, 7 * 24 * 60 * 60);

      this.logger.log(`✅ Archivo subido a S3: ${fileName}`);

      return { url, key: fileName };
    } catch (error) {
      this.logger.error(`❌ Error al subir archivo a S3: ${error.message}`);
      throw new BadRequestException('Error al subir el archivo. Verifica la configuración de AWS.');
    }
  }

  /**
   * Elimina un archivo de S3 o almacenamiento local
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useLocalStorage) {
      // Modo desarrollo: eliminar archivo local
      try {
        const filePath = path.join(this.uploadDir, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`✅ Archivo local eliminado: ${key}`);
        }
      } catch (error) {
        this.logger.error(`❌ Error al eliminar archivo local: ${error.message}`);
      }
    } else {
      // Modo producción: eliminar de S3
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });

        await this.s3Client!.send(command);
        this.logger.log(`✅ Archivo eliminado de S3: ${key}`);
      } catch (error) {
        this.logger.error(`❌ Error al eliminar archivo de S3: ${error.message}`);
      }
    }
  }

  /**
   * Genera una URL firmada para acceso temporal
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.useLocalStorage) {
      // Modo desarrollo: retornar URL local
      return `http://localhost:3000/uploads/${key.replace(/\\/g, '/')}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Error al generar URL firmada: ${error.message}`);
      throw new BadRequestException('Error al generar URL de acceso');
    }
  }
}
