import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS Configuration - Secure for production
  const frontendUrl = process.env.FRONTEND_URL;
  const nodeEnv = process.env.NODE_ENV;
  
  if (nodeEnv === 'production' && frontendUrl) {
    app.enableCors({
      origin: [frontendUrl],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    });
  } else {
    // Development mode - allow all origins explicitly
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    });
  }

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('App SENA - API')
    .setDescription('API para la gestión de instructores, fichas y aprendices del SENA')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Colegios')
    .addTag('Programas de Formación')
    .addTag('Fichas')
    .addTag('Aprendices')
    .addTag('Asistencias')
    .addTag('Disciplinario')
    .addTag('Planes de Trabajo Concertado')
    .addTag('Planes de Mejoramiento')
    .addTag('Actas')
    .addTag('Agenda')
    .addTag('Notificaciones')
    .addTag('Reportes')
    .addTag('Métricas')
    .addTag('Auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  // Listen on 0.0.0.0 for Docker containers (critical for Lightsail)
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  console.log(`📚 Swagger documentation: http://0.0.0.0:${port}/api/docs`);
  console.log(`🏥 Health check: http://0.0.0.0:${port}/api/health`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Hot Module Replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
