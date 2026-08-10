import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './core/config/config.module.js';
import { PrismaModule } from './core/database/prisma.module.js';
import { StorageModule } from './core/storage/storage.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { HealthModule } from './core/health/health.module.js';
import { ResponseInterceptor } from './core/interceptors/response.interceptor.js';
import { pinoLoggerConfig } from './core/logger/logger.config.js';
import { AppCacheModule } from './core/cache/cache.module.js';
import { AcademicModule } from './academic/academic.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { AdmissionModule } from './admission/admission.module.js';
import { PortalModule } from './portal/portal.module.js';
import { PresenceModule } from './presence/presence.module.js';
import { PayrollModule } from './payroll/payroll.module.js';
import { JwtAuthGuard } from './platform/auth/index.js';
import { PermissionGuard } from './platform/access-control/permission/guards/permission.guard.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    StorageModule,
    LoggerModule.forRoot(pinoLoggerConfig),
    ScheduleModule.forRoot(),
    AppCacheModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<
          'development' | 'production' | 'test'
        >('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';

        return [
          {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>(
              'THROTTLE_LIMIT',
              isProduction ? 100 : 500,
            ),
          },
          {
            name: 'auth',
            ttl: configService.get<number>('AUTH_THROTTLE_TTL', 60000),
            limit: configService.get<number>(
              'AUTH_THROTTLE_LIMIT',
              isProduction ? 5 : 20,
            ),
          },
          {
            // The portal's public surface gets its own bucket so a scraper
            // hammering the school website cannot exhaust the shared allowance
            // and degrade SIAKAD, inventory, or PPDB (FR-027, SC-012).
            //
            // The limit is high because **the unit of consumption is an image,
            // not a visitor**. Opening one 24-photo album costs 25 requests —
            // the album call plus a media redirect per photo — and a class of
            // thirty doing that on the school wifi arrives from a single NAT
            // address. Sized from that burst rather than from the monthly
            // average, which is four orders of magnitude smaller.
            //
            // A local benchmark at concurrency 20 sustained ~860 req/s with a
            // 44 ms p95, and the throttle was the only thing that pushed back —
            // so this limit, not the code, is what a real burst meets first.
            name: 'portal-public',
            ttl: configService.get<number>('PORTAL_THROTTLE_TTL', 60000),
            limit: configService.get<number>(
              'PORTAL_THROTTLE_LIMIT',
              isProduction ? 2000 : 5000,
            ),
          },
        ];
      },
    }),
    // Serves the portal's built assets. The HTML itself is NOT served from
    // here — PortalHtmlController owns that, because every response needs
    // per-path metadata injected before it leaves (research R3).
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath:
            configService.get<string>('PORTAL_DIST_PATH') ??
            resolve(process.cwd(), '../apps/portal/dist'),
          serveRoot: '/',
          serveStaticOptions: { index: false, fallthrough: true },
          exclude: ['/portal/{*splat}', '/auth/{*splat}', '/files/{*splat}'],
        },
      ],
    }),
    HealthModule,
    PlatformModule,
    AcademicModule,
    InventoryModule,
    AdmissionModule,
    PresenceModule,
    PayrollModule,
    // PortalModule stays last: its PortalHtmlModule answers `GET *` to serve
    // the SPA shell, and Nest matches controllers in registration order, so a
    // module listed after it never receives a request.
    PortalModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
