import { Injectable } from '@nestjs/common';
import {
  AppKey,
  AppSettingRepository,
} from '../repositories/app-setting.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { DEFAULT_APP_SETTINGS } from '../constants/default-app-settings.constant.js';
import { toAppSettingResponseDto } from '../mappers/app-setting.mapper.js';

@Injectable()
export class GetAppSettingUseCase {
  constructor(
    private readonly repository: AppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey) {
    let entity = await this.repository.findByAppKey(appKey);

    entity ??= await this.repository.upsert(
      appKey,
      DEFAULT_APP_SETTINGS[appKey],
    );
    return toAppSettingResponseDto(entity, this.storage);
  }
}
