import { AppKey, Prisma } from '@prisma/client';

export { AppKey };

export const APP_SETTING_WITH_FILES = {
  include: { logoFile: true, faviconFile: true },
} satisfies Prisma.AppSettingDefaultArgs;

export type AppSettingWithFiles = Prisma.AppSettingGetPayload<
  typeof APP_SETTING_WITH_FILES
>;
