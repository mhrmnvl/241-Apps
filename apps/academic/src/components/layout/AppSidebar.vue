<script setup lang="ts">
import type { SidebarProps } from '@/ui/sidebar'

import { useAuthSession } from '@/features/platform/auth'
import { useMenuVisibility } from '@/composables/useMenuVisibility'
import { academicYearApi } from '@/features/academic/academic-year/api/academicYearApi'
import { semesterApi } from '@/features/academic/semester/api/semesterApi'
import type { AcademicYear } from '@/features/academic/academic-year'
import type { Semester } from '@/features/academic/semester'
import NavMain from './NavMain.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'
import { onMounted, ref } from 'vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'sidebar',
  collapsible: 'icon',
})

const { user, syncAuthenticatedUserProfile } = useAuthSession()
const { filteredSections } = useMenuVisibility()
const activeAcademicInfo = ref({ academicYear: 'Memuat...', semester: '' })

const scrollContainer = ref<HTMLDivElement | null>(null)
const STORAGE_KEY = 'sidebar-scroll-position'

onMounted(() => {
  if (user.value) {
    void syncAuthenticatedUserProfile()
    void fetchActiveAcademicInfo()
  }

  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved && scrollContainer.value) {
    scrollContainer.value.scrollTop = parseInt(saved, 10)
  }
})

function handleScroll(e: Event) {
  const target = e.target as HTMLDivElement
  sessionStorage.setItem(STORAGE_KEY, String(target.scrollTop))
}

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
      <div
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto"
        @scroll="handleScroll"
      >
        <NavMain :sections="filteredSections" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
