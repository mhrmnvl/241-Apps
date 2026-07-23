import { Injectable } from '@nestjs/common';
import { AppKey } from '@prisma/client';
import { AppSettingRepository } from '../repositories/app-setting.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { DEFAULT_APP_SETTINGS } from '../constants/default-app-settings.constant.js';
import { toAppSettingResponseDto } from '../infrastructure/app-setting.mapper.js';

@Injectable()
export class GetAppSettingUseCase {
  constructor(
    private readonly repo: AppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey) {
    let entity = await this.repo.findByAppKey(appKey);
    // Self-heal instead of 404ing: production only runs the minimal admin
    // seed (no lookups), so a fresh DB would otherwise never have this row
    // until someone remembers to run the full demo seed.
    if (!entity) {
      entity = await this.repo.upsert(appKey, DEFAULT_APP_SETTINGS[appKey]);
    }
    return toAppSettingResponseDto(entity, this.storage);
  }
}
