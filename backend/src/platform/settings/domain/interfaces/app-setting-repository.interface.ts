import { AppKey, AppSettingWithFiles } from '../entities/app-setting.entity.js';

export { AppKey };
export type { AppSettingWithFiles };

export interface AppSettingScalarInput {
  appTitle?: string;
  appSubtitle?: string;
  loginTitle?: string;
  metaDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerText?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  hiddenMenuKeys?: string[];
  updatedBy?: string;
}

export abstract class IAppSettingRepository {
  abstract findByAppKey(appKey: AppKey): Promise<AppSettingWithFiles | null>;
  abstract upsert(
    appKey: AppKey,
    data: AppSettingScalarInput,
  ): Promise<AppSettingWithFiles>;
  abstract setLogoFile(
    appKey: AppKey,
    fileId: string,
  ): Promise<AppSettingWithFiles>;
  abstract setFaviconFile(
    appKey: AppKey,
    fileId: string,
  ): Promise<AppSettingWithFiles>;
}
