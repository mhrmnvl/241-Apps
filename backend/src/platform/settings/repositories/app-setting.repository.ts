import { Injectable } from '@nestjs/common';
import { AppKey, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';

const WITH_FILES = {
  include: { logoFile: true, faviconFile: true },
} satisfies Prisma.AppSettingDefaultArgs;

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

@Injectable()
export class AppSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAppKey(appKey: AppKey) {
    return this.prisma.appSetting.findUnique({
      where: { appKey },
      ...WITH_FILES,
    });
  }

  async upsert(appKey: AppKey, data: AppSettingScalarInput) {
    return this.prisma.appSetting.upsert({
      where: { appKey },
      update: data,
      create: {
        appKey,
        appTitle: appKey,
        appSubtitle: '',
        loginTitle: '',
        metaDescription: '',
        ...data,
      },
      ...WITH_FILES,
    });
  }

  async setLogoFile(appKey: AppKey, fileId: string) {
    return this.prisma.appSetting.update({
      where: { appKey },
      data: { logoFileId: fileId },
      ...WITH_FILES,
    });
  }

  async setFaviconFile(appKey: AppKey, fileId: string) {
    return this.prisma.appSetting.update({
      where: { appKey },
      data: { faviconFileId: fileId },
      ...WITH_FILES,
    });
  }
}
