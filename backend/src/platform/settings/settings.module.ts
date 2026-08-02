import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module.js';
import { SettingsController } from './presentation/settings.controller.js';
import { PrismaAppSettingRepository } from './infrastructure/persistence/prisma-app-setting.repository.js';
import { IAppSettingRepository } from './domain/interfaces/app-setting-repository.interface.js';
import { GetAppSettingUseCase } from './use-cases/get-app-setting.use-case.js';
import { UpdateAppSettingUseCase } from './use-cases/update-app-setting.use-case.js';
import { UploadAppSettingLogoUseCase } from './use-cases/upload-app-setting-logo.use-case.js';
import { UploadAppSettingFaviconUseCase } from './use-cases/upload-app-setting-favicon.use-case.js';

@Module({
  imports: [FileModule],
  controllers: [SettingsController],
  providers: [
    {
      provide: IAppSettingRepository,
      useClass: PrismaAppSettingRepository,
    },
    GetAppSettingUseCase,
    UpdateAppSettingUseCase,
    UploadAppSettingLogoUseCase,
    UploadAppSettingFaviconUseCase,
  ],
  exports: [IAppSettingRepository],
})
export class SettingsModule {}
