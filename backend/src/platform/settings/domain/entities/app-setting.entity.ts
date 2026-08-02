import { AppKey } from '../../../../shared/domain/enums/app-key.enum.js';
import { FileEntity } from '../../../file/domain/entities/file.entity.js';
export { AppKey };

export interface AppSettingEntity {
  id: string;
  /**
   * Value union rather than the enum: persistence returns a plain string, and
   * a TS string enum is nominal so a raw `'ACADEMIC'` would not be assignable.
   */
  appKey: `${AppKey}`;
  appTitle: string;
  appSubtitle: string;
  loginTitle: string;
  metaDescription: string;
  contactEmail: string | null;
  contactPhone: string | null;
  footerText: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  logoFileId: string | null;
  faviconFileId: string | null;
  hiddenMenuKeys: string[];
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettingWithFiles extends AppSettingEntity {
  logoFile: FileEntity | null;
  faviconFile: FileEntity | null;
}

export type AppSettingWithFilesEntity = AppSettingWithFiles;
