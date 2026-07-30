import type { AppSetting, File } from '@prisma/client';
import { StorageService } from '../../../core/storage/storage.service.js';
import { AppSettingResponseDto } from '../dto/response/app-setting-response.dto.js';

type AppSettingWithFiles = AppSetting & {
  logoFile: File | null;
  faviconFile: File | null;
};

export async function toAppSettingResponseDto(
  entity: AppSettingWithFiles,
  storage: StorageService,
): Promise<AppSettingResponseDto> {
  const [logoUrl, faviconUrl] = await Promise.all([
    entity.logoFile ? storage.getSignedUrl(entity.logoFile.storageKey) : null,
    entity.faviconFile
      ? storage.getSignedUrl(entity.faviconFile.storageKey)
      : null,
  ]);

  return {
    id: entity.id,
    appKey: entity.appKey,
    appTitle: entity.appTitle,
    appSubtitle: entity.appSubtitle,
    loginTitle: entity.loginTitle,
    metaDescription: entity.metaDescription,
    logoUrl,
    faviconUrl,
    contactEmail: entity.contactEmail,
    contactPhone: entity.contactPhone,
    footerText: entity.footerText,
    maintenanceMode: entity.maintenanceMode,
    maintenanceMessage: entity.maintenanceMessage,
    hiddenMenuKeys: entity.hiddenMenuKeys,
    updatedAt: entity.updatedAt,
  };
}
