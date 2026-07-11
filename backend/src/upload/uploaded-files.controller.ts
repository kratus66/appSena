import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

/**
 * Sirve los archivos guardados en disco local (modo desarrollo, sin AWS
 * configurado) detrás de autenticación. En producción con S3 configurado
 * este controller no se usa: las URLs son firmadas directamente por S3.
 */
@ApiTags('Upload')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadedFilesController {
  constructor(private readonly uploadService: UploadService) {}

  @Get(':folder/:filename')
  @ApiOperation({ summary: 'Descargar un archivo de evidencia (requiere sesión)' })
  @ApiExcludeEndpoint()
  getFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const filePath = this.uploadService.resolveLocalFilePath(`${folder}/${filename}`);
    response.sendFile(filePath);
  }
}
