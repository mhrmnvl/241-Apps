import { AppKey, PrismaClient } from '@prisma/client';
import { DEFAULT_APP_SETTINGS } from '../../../src/platform/settings/constants/default-app-settings.constant.js';

export async function seedAppSettings(prisma: PrismaClient) {
  console.log('  [app-settings] Seeding app settings...');
  for (const appKey of Object.values(AppKey)) {
    const data = DEFAULT_APP_SETTINGS[appKey];
    await prisma.appSetting.upsert({
      where: { appKey },
      update: {},
      create: {
        appKey,
        ...data,
        maintenanceMode: false,
        hiddenMenuKeys: [],
      },
    });
  }
}
