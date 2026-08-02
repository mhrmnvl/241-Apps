import { Injectable } from '@nestjs/common';
import {
  AppKey,
  IAppSettingRepository,
} from '../domain/interfaces/app-setting-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { UpdateAppSettingDto } from '../dto/request/update-app-setting.dto.js';
import { toAppSettingResponseDto } from '../mappers/app-setting.mapper.js';

@Injectable()
export class UpdateAppSettingUseCase {
  constructor(
    private readonly appSettingRepository: IAppSettingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(appKey: AppKey, dto: UpdateAppSettingDto, updatedBy: string) {
    const entity = await this.appSettingRepository.upsert(appKey, {
      ...dto,
      updatedBy,
    });
    return toAppSettingResponseDto(entity, this.storage);
  }
}
