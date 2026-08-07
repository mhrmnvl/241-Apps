import { Global, Module } from '@nestjs/common';
import { PortalCacheInterceptor } from './interceptors/portal-cache.interceptor.js';
import { PortalCacheService } from './services/portal-cache.service.js';

/**
 * Cross-cutting portal infrastructure.
 *
 * `@Global()` because `@PortalPublic()` attaches the cache interceptor to
 * controllers in seven different modules, and every write use case that changes
 * public content calls `invalidate()`. Declaring the dependency in each module
 * would be seven identical imports, and forgetting one would show up as a
 * public page that never updates — a bug nobody thinks to look for in a module
 * list.
 */
@Global()
@Module({
  providers: [PortalCacheService, PortalCacheInterceptor],
  exports: [PortalCacheService, PortalCacheInterceptor],
})
export class PortalSharedModule {}
