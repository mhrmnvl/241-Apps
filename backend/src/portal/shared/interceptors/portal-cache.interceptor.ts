import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, of, tap } from 'rxjs';
import { PortalCacheService } from '../services/portal-cache.service.js';

/** Short enough that a cache-clearing bug degrades rather than breaks. */
const PORTAL_CACHE_TTL_MS = 60_000;

/**
 * Caches anonymous portal reads, keyed by full URL (research R9).
 *
 * Applied through `@PortalPublic()`, so every public endpoint gets it and none
 * has to remember to.
 *
 * Two things it deliberately does not cache:
 *
 * - **Anything but GET.** There are no public writes, but keying a POST by URL
 *   would be a real bug if one were ever added.
 * - **The media redirect**, which opts out via `@SkipPortalCache()`. Its
 *   response is a redirect to an expiring signed URL, so a cached one starts
 *   pointing at a dead credential — the address is stable, the target is not.
 */
@Injectable()
export class PortalCacheInterceptor implements NestInterceptor {
  constructor(private readonly cache: PortalCacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') return next.handle();

    const key = request.originalUrl;
    const cached = await this.cache.get<unknown>(key);
    if (cached !== undefined) return of(cached);

    return next.handle().pipe(
      tap((value) => {
        // Fire-and-forget: a slow cache write must not delay the response, and
        // a failed one only costs the next visitor a cold render.
        void this.cache.set(key, value, PORTAL_CACHE_TTL_MS);
      }),
    );
  }
}
