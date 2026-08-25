<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoleGuard } from '@/features/platform/auth'
import { DashboardView } from '@/features/platform/dashboard'
import { Alert, AlertDescription } from '@/ui/alert'
import { Skeleton } from '@/ui/skeleton'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { AlertCircle, LayoutDashboard } from 'lucide-vue-next'
import StudentDashboard from '../components/StudentDashboard.vue'
import TeacherDashboard from '../components/TeacherDashboard.vue'
import { useMyDashboard } from '../composables/useMyDashboard'
import { selectDashboardPanels } from '../logic/selectDashboardPanels'

const { can } = useRoleGuard()
const { dashboard, loading, loadError, loaded, fetchMyDashboard } =
  useMyDashboard()

const canReadOwn = computed(() => can('dashboards.read-own'))
const canReadInstitution = computed(() => can('dashboards.read'))

const needsPersonal = computed(
  () => canReadOwn.value && !canReadInstitution.value,
)

const student = computed(() => dashboard.value?.student ?? null)
const teacher = computed(() => dashboard.value?.teacher ?? null)
const isWeeklyHoliday = computed(
  () => dashboard.value?.today.isWeeklyHoliday ?? false,
)
const todayDate = computed(() => dashboard.value?.today.date ?? undefined)

const panels = computed(() =>
  selectDashboardPanels(dashboard.value, canReadInstitution.value),
)

const defaultPanel = computed(() => panels.value[0]?.value ?? '')

const isDeciding = computed(
  () => needsPersonal.value && (loading.value || !loaded.value),
)

onMounted(() => {
  if (!needsPersonal.value) return
  void fetchMyDashboard()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <!-- Admin dashboard has its own Card wrapper, so it renders standalone -->
    <template v-if="!needsPersonal">
      <DashboardView />
    </template>

    <!-- Personal dashboards get the same outer Card as admin -->
    <Card
      v-else
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Dashboard
          </CardTitle>
        </div>
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- Loading skeleton -->
        <div
          v-if="isDeciding"
          class="space-y-6"
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton
              v-for="i in 3"
              :key="i"
              class="h-[84px] w-full rounded-lg"
            />
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <Skeleton class="h-64 w-full rounded-lg" />
            <Skeleton class="h-64 w-full rounded-lg" />
          </div>
        </div>

        <template v-else>
          <Alert
            v-if="loadError"
            variant="destructive"
          >
            <AlertCircle class="size-4" />
            <AlertDescription>{{ loadError }}</AlertDescription>
          </Alert>

          <div
            v-if="panels.length === 0"
            class="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground"
          >
            <LayoutDashboard class="size-10 opacity-40" />
            <p class="text-sm">Belum ada dashboard untuk akun Anda.</p>
          </div>

          <!-- Single panel: no tab strip -->
          <template v-else-if="panels.length === 1">
            <StudentDashboard
              v-if="defaultPanel === 'student' && student"
              :data="student"
              :is-weekly-holiday="isWeeklyHoliday"
              :loading="loading"
            />
            <TeacherDashboard
              v-else-if="defaultPanel === 'teacher' && teacher"
              :data="teacher"
              :is-weekly-holiday="isWeeklyHoliday"
              :loading="loading"
              :today-date="todayDate"
            />
          </template>

          <!-- Dual panels: tabs -->
          <Tabs
            v-else
            :default-value="defaultPanel"
          >
            <TabsList>
              <TabsTrigger
                v-for="panel in panels"
                :key="panel.value"
                :value="panel.value"
              >
                {{ panel.label }}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              v-if="student"
              value="student"
              class="mt-4"
            >
              <StudentDashboard
                :data="student"
                :is-weekly-holiday="isWeeklyHoliday"
                :loading="loading"
              />
            </TabsContent>
            <TabsContent
              v-if="teacher"
              value="teacher"
              class="mt-4"
            >
              <TeacherDashboard
                :data="teacher"
                :is-weekly-holiday="isWeeklyHoliday"
                :loading="loading"
                :today-date="todayDate"
              />
            </TabsContent>
          </Tabs>
        </template>
      </div>
    </Card>
  </div>
</template>
