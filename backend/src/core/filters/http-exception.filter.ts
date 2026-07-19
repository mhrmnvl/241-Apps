import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.resolveException(exception);
    const url = request.originalUrl || request.url;
    const errorText = Array.isArray(message) ? message.join('; ') : message;

    response.status(statusCode).json({ statusCode, message, data: null });

    const responseTime = request._startTime
      ? Date.now() - request._startTime
      : undefined;

    const summary = `${request.method} ${url} - ${String(statusCode)} - ${errorText}`;

    if (url === '/favicon.ico') return;

    const userId = request.user?.id;

    if (statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        { statusCode, responseTime, stack, details: exception, userId },
        summary,
      );
    } else {
      this.logger.warn({ statusCode, responseTime, userId }, summary);
    }
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();

      if (statusCode >= 500) {
        return { statusCode, message: 'Internal server error' };
      }

      return { statusCode, message: this.extractClientMessage(exception) };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const fields = Array.isArray(exception.meta?.target)
          ? (exception.meta.target as string[]).join(', ')
          : 'field';
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with the same ${fields} already exists`,
        };
      }

      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message:
            (exception.meta?.cause as string | undefined) ?? 'Record not found',
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private extractClientMessage(exception: HttpException): string | string[] {
    const body = exception.getResponse();

    if (typeof body === 'string') return body;

    if (typeof body === 'object' && body !== null) {
      const res = body as { message?: string | string[] };
      return res.message ?? exception.message;
    }

    return exception.message;
  }
}
