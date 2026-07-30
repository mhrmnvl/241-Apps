import { Injectable } from '@nestjs/common';
import {
  AppKey,
  AppSettingRepository,
} from '../repositories/app-setting.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { UpdateAppSettingDto } from '../dto/request/update-app-setting.dto.js';
import { toAppSettingResponseDto } from '../mappers/app-setting.mapper.js';

@Injectable()
export class UpdateAppSettingUseCase {
  constructor(
    private readonly repository: AppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey, dto: UpdateAppSettingDto, updatedBy: string) {
    const entity = await this.repository.upsert(appKey, { ...dto, updatedBy });
    return toAppSettingResponseDto(entity, this.storage);
  }
}
