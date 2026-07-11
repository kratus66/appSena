import { ConfigService } from '@nestjs/config';

const MIN_JWT_SECRET_LENGTH = 32;

export function getRequiredJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret || secret.trim().length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET no está definido o es demasiado corto (mínimo ${MIN_JWT_SECRET_LENGTH} caracteres). ` +
        'Configurá una variable de entorno JWT_SECRET fuerte antes de arrancar la aplicación.',
    );
  }

  return secret;
}
