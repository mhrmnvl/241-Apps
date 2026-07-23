import { ref } from 'vue'
import type { AppKey } from '../settings/types/app-setting.types'

export const authConfig = ref({
  appKey: 'ACADEMIC' as AppKey,
  appTitle: 'SIAKAD 241',
  appSubtitle: 'Sistem Informasi Akademik',
  logoAlt: 'SIAKAD Logo',
  loginTitle: 'Masuk ke SIAKAD',
})

export function configureAuth(config: Partial<typeof authConfig.value>) {
  authConfig.value = { ...authConfig.value, ...config }
}
