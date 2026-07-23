import { Injectable } from '@nestjs/common';
import { AppKey } from '@prisma/client';
import { AppSettingRepository } from '../repositories/app-setting.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { UpdateAppSettingDto } from '../dto/request/update-app-setting.dto.js';
import { toAppSettingResponseDto } from '../infrastructure/app-setting.mapper.js';

@Injectable()
export class UpdateAppSettingUseCase {
  constructor(
    private readonly repo: AppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey, dto: UpdateAppSettingDto, updatedBy: string) {
    const entity = await this.repo.upsert(appKey, { ...dto, updatedBy });
    return toAppSettingResponseDto(entity, this.storage);
  }
}
