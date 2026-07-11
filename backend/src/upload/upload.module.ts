import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadedFilesController } from './uploaded-files.controller';

@Module({
  controllers: [UploadController, UploadedFilesController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
