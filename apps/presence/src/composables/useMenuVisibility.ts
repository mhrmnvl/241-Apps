import { storeToRefs } from 'pinia'
import { useAuthSession } from '@/features/platform/auth'
import { useSettingsStore } from '@/features/platform/settings'
import { useMenuVisibility as useSharedMenuVisibility } from '@/shared/composables/useMenuVisibility'
import { menuSections } from '@/config/menuConfig'

export function useMenuVisibility() {
  const { roles, permissions } = useAuthSession()
  const { hiddenMenuKeys } = storeToRefs(useSettingsStore())
  return useSharedMenuVisibility(menuSections, {
    roles,
    permissions,
    hiddenMenuKeys,
  })
}
