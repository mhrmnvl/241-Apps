import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { StorageKeyBuilder } from './storage-key-builder.service.js';

@Global()
@Module({
  providers: [StorageService, StorageKeyBuilder],
  exports: [StorageService, StorageKeyBuilder],
})
export class StorageModule {}
