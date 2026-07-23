import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module.js';
import { SettingsController } from './presentation/settings.controller.js';
import { AppSettingRepository } from './repositories/app-setting.repository.js';
import { GetAppSettingUseCase } from './use-cases/get-app-setting.use-case.js';
import { UpdateAppSettingUseCase } from './use-cases/update-app-setting.use-case.js';
import { UploadAppSettingLogoUseCase } from './use-cases/upload-app-setting-logo.use-case.js';
import { UploadAppSettingFaviconUseCase } from './use-cases/upload-app-setting-favicon.use-case.js';

@Module({
  imports: [FileModule],
  controllers: [SettingsController],
  providers: [
    AppSettingRepository,
    GetAppSettingUseCase,
    UpdateAppSettingUseCase,
    UploadAppSettingLogoUseCase,
    UploadAppSettingFaviconUseCase,
  ],
})
export class SettingsModule {}
