import { Injectable } from '@nestjs/common';
import {
  AppKey,
  IAppSettingRepository,
} from '../domain/interfaces/app-setting-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { DEFAULT_APP_SETTINGS } from '../constants/default-app-settings.constant.js';
import { toAppSettingResponseDto } from '../mappers/app-setting.mapper.js';

@Injectable()
export class GetAppSettingUseCase {
  constructor(
    private readonly appSettingRepository: IAppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey) {
    let entity = await this.appSettingRepository.findByAppKey(appKey);

    entity ??= await this.appSettingRepository.upsert(
      appKey,
      DEFAULT_APP_SETTINGS[appKey],
    );
    return toAppSettingResponseDto(entity, this.storage);
  }
}
