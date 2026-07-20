<script setup lang="ts">
import type { SidebarProps } from '@/ui/sidebar'

import { useAuthSession } from '@/features/platform/auth'
import { academicYearApi } from '@/features/academic/academic-year/api/academicYearApi'
import { semesterApi } from '@/features/academic/semester/api/semesterApi'
import type { AcademicYear } from '@/features/academic/academic-year'
import type { Semester } from '@/features/academic/semester'
import NavMain from './NavMain.vue'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'
import { menuSections } from '@/config/menuConfig'
import type { MenuSection, MenuItem, SubMenuItem } from '@/config/menuConfig'
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'sidebar',
  collapsible: 'icon',
})

const { user, syncAuthenticatedUserProfile } = useAuthSession()
const activeAcademicInfo = ref({ academicYear: 'Memuat...', semester: '' })

const userRoles = computed(() => user.value?.roles ?? [])
const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))
const isStaff = computed(
  () =>
    userRoles.value.length > 0 &&
    !userRoles.value.every((r) => r === 'STUDENT'),
)

const filteredSections = computed(() => {
  if (isSuperAdmin.value) return menuSections

  const roles = userRoles.value
  const hasRole = (r: string) => roles.includes(r)

  // Role custom (non-sistem) tidak ada di allowedRoles → perlakukan seperti ADMIN
  const effectiveHasRole = (r: string) => {
    if (hasRole(r)) return true
    // Kalau r adalah role staff (ADMIN/TEACHER) dan user adalah staff → izinkan
    if (
      isStaff.value &&
      (r === 'ADMIN' || r === 'TEACHER') &&
      !roles.includes('STUDENT')
    )
      return true
    return false
  }

  return menuSections
    .filter((section: MenuSection) => {
      if (!section.allowedRoles || section.allowedRoles.length === 0)
        return true
      return section.allowedRoles.some(effectiveHasRole)
    })
    .map((section: MenuSection) => {
      const filteredItems = section.items
        .filter((item: MenuItem) => {
          if (!item.allowedRoles || item.allowedRoles.length === 0) return true
          return item.allowedRoles.some(effectiveHasRole)
        })
        .map((item: MenuItem): MenuItem | null => {
          if (!item.items) return item
          const filteredSubs = item.items.filter((sub: SubMenuItem) => {
            if (!sub.allowedRoles || sub.allowedRoles.length === 0) return true
            return sub.allowedRoles.some(effectiveHasRole)
          })
          if (filteredSubs.length === 0 && item.items.length > 0) return null
          return { ...item, items: filteredSubs }
        })
        .filter((item: MenuItem | null): item is MenuItem => item !== null)

      if (filteredItems.length === 0) return null
      return { ...section, items: filteredItems }
    })
    .filter(
      (section: MenuSection | null): section is MenuSection => section !== null,
    )
})

onMounted(() => {
  if (user.value) {
    void syncAuthenticatedUserProfile()
    void fetchActiveAcademicInfo()
  }
})

async function fetchActiveAcademicInfo() {
  try {
    const [ayRes, semRes] = await Promise.all([
      academicYearApi.getAcademicYears(),
      semesterApi.getSemesters({ limit: 100 }),
    ])

    const ayData = ayRes.data?.data ?? []
    const semData = semRes.data?.data ?? []
    const activeAy = Array.isArray(ayData)
      ? ayData.find((ay: AcademicYear) => ay.isActive)
      : null
    const activeSem = Array.isArray(semData)
      ? semData.find((sem: Semester) => sem.isActive)
      : null

    if (activeAy) activeAcademicInfo.value.academicYear = activeAy.name
    else activeAcademicInfo.value.academicYear = 'Belum diatur'

    if (activeSem) {
      const semName =
        activeSem.type?.name === 'ODD'
          ? 'Ganjil'
          : activeSem.type?.name === 'EVEN'
            ? 'Genap'
            : (activeSem.type?.name ?? '-')
      activeAcademicInfo.value.semester = `Semester ${semName}`
    }
  } catch {
    activeAcademicInfo.value.academicYear = 'Gagal memuat'
  }
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            as-child
          >
            <RouterLink to="/dashboard">
              <img
                src="/logo.webp"
                alt="SIAKAD Logo"
                class="size-8 rounded-lg object-contain"
              />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold text-base">SIAKAD 241</span>
                <span
                  class="truncate text-xs text-muted-foreground font-medium"
                >
                  {{ activeAcademicInfo.academicYear }}
                  {{
                    activeAcademicInfo.semester
                      ? `- ${activeAcademicInfo.semester}`
                      : ''
                  }}
                </span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <ScrollArea class="h-full w-full">
        <NavMain :sections="filteredSections" />
      </ScrollArea>
    </SidebarContent>
  </Sidebar>
</template>
