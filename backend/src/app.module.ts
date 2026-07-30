import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
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
        ];
      },
    }),
    HealthModule,
    PlatformModule,
    AcademicModule,
    InventoryModule,
    AdmissionModule,
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
