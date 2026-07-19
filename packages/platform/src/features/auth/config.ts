import { ref } from 'vue'

export const authConfig = ref({
  appTitle: 'SIAKAD 241',
  appSubtitle: 'Sistem Informasi Akademik',
  logoAlt: 'SIAKAD Logo',
  loginTitle: 'Masuk ke SIAKAD',
})

export function configureAuth(config: Partial<typeof authConfig.value>) {
  authConfig.value = { ...authConfig.value, ...config }
}
