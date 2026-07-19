import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 10 * 1000,
      max: 100,
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
