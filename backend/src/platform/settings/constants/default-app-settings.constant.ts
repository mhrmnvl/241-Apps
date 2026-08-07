import { AppKey } from '../../../shared/domain/enums/app-key.enum.js';

export interface DefaultAppSettingValues {
  appTitle: string;
  appSubtitle: string;
  loginTitle: string;
  metaDescription: string;
}

// Single source of truth for the fallback branding values — used both to
// seed AppSetting rows (prisma/seeds/modules/app-setting.seed.ts) and to
// self-heal a missing row on read (GetAppSettingUseCase), so a fresh/
// partially-seeded database never 404s on GET /settings/:appKey.
export const DEFAULT_APP_SETTINGS: Record<AppKey, DefaultAppSettingValues> = {
  ACADEMIC: {
    appTitle: 'SIAKAD 241',
    appSubtitle: 'Sistem Informasi Akademik',
    loginTitle: 'Masuk ke SIAKAD',
    metaDescription: 'Sistem Informasi Akademik MTs Persis 241 Al-Ikhlash',
  },
  INVENTORY: {
    appTitle: 'SIMAS 241',
    appSubtitle: 'Sistem Informasi Manajemen Aset',
    loginTitle: 'Masuk ke SIMAS',
    metaDescription:
      'Sistem Informasi Manajemen Aset MTs Persis 241 Al-Ikhlash',
  },
  ADMISSION: {
    appTitle: 'PSB 241',
    appSubtitle: 'Penerimaan Santri Baru',
    loginTitle: 'Masuk ke Portal PSB',
    metaDescription: 'Penerimaan Santri Baru MTs Persis 241 Al-Ikhlash',
  },
  PORTAL: {
    appTitle: 'Portal 241',
    appSubtitle: 'MTs Persis 241 Al-Ikhlash',
    loginTitle: 'Masuk ke Portal 241',
    metaDescription:
      'Berita, artikel, agenda, dan informasi resmi MTs Persis 241 Al-Ikhlash',
  },
};
