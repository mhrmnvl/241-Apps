import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

/** Shape returned by paginated repositories: findAll() → { data, total, page, limit } */
interface PaginatedPayload<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function isPaginatedPayload(body: unknown): body is PaginatedPayload<unknown> {
  return (
    body !== null &&
    typeof body === 'object' &&
    'data' in body &&
    'total' in body &&
    'page' in body &&
    'limit' in body &&
    Array.isArray((body as Record<string, unknown>).data)
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T> | StreamableFile
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T> | StreamableFile> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<import('express').Response>();

    return next.handle().pipe(
      map((body: unknown) => {
        if (body instanceof StreamableFile) {
          return body;
        }

        const statusCode = response.statusCode;

        // Paginated repo shape: { data[], total, page, limit } → { data, meta }
        if (isPaginatedPayload(body)) {
          const { data, total, page, limit } = body;
          return {
            statusCode,
            message: 'Success',
            data: data as T,
            meta: { total, page, limit },
          };
        }

        // Already-wrapped envelope: { data, meta, message? }
        if (
          body &&
          typeof body === 'object' &&
          'data' in body &&
          'meta' in body
        ) {
          const resBody = body as {
            message?: string;
            data: T;
            meta?: Record<string, unknown>;
          };
          return {
            statusCode,
            message: resBody.message ?? 'Success',
            data: resBody.data,
            meta: resBody.meta,
          };
        }

        return {
          statusCode,
          message: 'Success',
          data: body as T,
        };
      }),
    );
  }
}
