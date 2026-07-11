import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global: normaliza toda respuesta de error hacia el cliente y deja
 * el detalle real (stack, mensaje de Postgres/TypeORM, etc.) solo en el log
 * del servidor. Sin esto, un error no controlado (constraint de DB, null
 * pointer) llega al cliente con el mensaje interno de Nest/Express.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Ha ocurrido un error inesperado. Intenta de nuevo más tarde.';

    if (!isHttpException || status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const detail = exception instanceof Error ? exception.stack : exception;
      this.logger.error(`${request.method} ${request.url} → ${status}`, detail);
    }

    const body =
      typeof message === 'string'
        ? { statusCode: status, message }
        : { statusCode: status, ...message };

    response.status(status).json(body);
  }
}
