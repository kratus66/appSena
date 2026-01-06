import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(SeederService);

    logger.log('🌱 Ejecutando seeders...');
    await seeder.seed();
    logger.log('✅ Seeders completados exitosamente');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  }
}

bootstrap();
