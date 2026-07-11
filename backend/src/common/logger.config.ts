import { Params } from 'nestjs-pino';

/**
 * Logging estructurado (JSON en producción, legible en consola en desarrollo).
 * Nivel configurable con LOG_LEVEL; por defecto 'debug' en dev y 'info' en prod.
 * Redacta credenciales y tokens para que nunca queden en los logs.
 */
export function buildLoggerOptions(): Params {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
          'req.body.password',
          'req.body.passwordActual',
          'req.body.passwordNueva',
        ],
        censor: '***',
      },
      autoLogging: {
        ignore: (req) => req.url === '/api/health',
      },
    },
  };
}
