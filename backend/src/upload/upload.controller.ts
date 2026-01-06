import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('evidencia')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo de evidencia',
    description: 'Permite subir un archivo (PDF, imagen o documento Word) a AWS S3 como evidencia',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (PDF, JPG, PNG, WEBP, DOC, DOCX - máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL pública del archivo subido',
        },
        key: {
          type: 'string',
          description: 'Clave del archivo en S3',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo no válido o error en la carga',
  })
  async uploadEvidencia(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo');
    }

    return this.uploadService.uploadFile(file, 'evidencias-asistencias');
  }
}
