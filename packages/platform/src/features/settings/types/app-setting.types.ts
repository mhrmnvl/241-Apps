export type AppKey =
  'ACADEMIC' | 'INVENTORY' | 'ADMISSION' | 'PORTAL' | 'PRESENCE'

export interface AppSetting {
  id: string
  appKey: AppKey
  appTitle: string
  appSubtitle: string
  loginTitle: string
  metaDescription: string
  logoUrl: string | null
  faviconUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  footerText: string | null
  maintenanceMode: boolean
  maintenanceMessage: string | null
  hiddenMenuKeys: string[]
  updatedAt: string
}

export type UpdateAppSettingPayload = Partial<
  Pick<
    AppSetting,
    | 'appTitle'
    | 'appSubtitle'
    | 'loginTitle'
    | 'metaDescription'
    | 'contactEmail'
    | 'contactPhone'
    | 'footerText'
    | 'maintenanceMode'
    | 'maintenanceMessage'
    | 'hiddenMenuKeys'
  >
>
