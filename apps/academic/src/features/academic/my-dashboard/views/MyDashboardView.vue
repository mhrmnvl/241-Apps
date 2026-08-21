<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoleGuard } from '@/features/platform/auth'
import { DashboardView } from '@/features/platform/dashboard'
import { Alert, AlertDescription } from '@/ui/alert'
import { Skeleton } from '@/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { AlertCircle, LayoutDashboard } from 'lucide-vue-next'
import StudentDashboard from '../components/StudentDashboard.vue'
import TeacherDashboard from '../components/TeacherDashboard.vue'
import { useMyDashboard } from '../composables/useMyDashboard'
import { selectDashboardPanels } from '../logic/selectDashboardPanels'

/**
 * Which dashboard a person sees, decided by their records.
 *
 * Nothing here reads a role name. The payload's two halves are already the
 * answer — the backend resolved the caller to a student record and a teacher
 * record, so a teacher the school gave an invented role (SARPRAS exists) still
 * gets a teacher half, and a role renamed on a whim changes nothing. The only
 * thing asked of the permission set is whether to make each call at all.
 */
const { can } = useRoleGuard()
const { dashboard, loading, loadError, loaded, fetchMyDashboard } =
  useMyDashboard()

const canReadOwn = computed(() => can('dashboards.read-own'))
const canReadInstitution = computed(() => can('dashboards.read'))

const student = computed(() => dashboard.value?.student ?? null)
const teacher = computed(() => dashboard.value?.teacher ?? null)
const isWeeklyHoliday = computed(
  () => dashboard.value?.today.isWeeklyHoliday ?? false,
)

/**
 * The panels this person has. One renders bare; several render as tabs.
 * The rule itself lives in `selectDashboardPanels`, where it is spec'd.
 */
const panels = computed(() =>
  selectDashboardPanels(dashboard.value, canReadInstitution.value),
)

const defaultPanel = computed(() => panels.value[0]?.value ?? '')

// Still waiting on the answer that decides what to render. Someone without the
// own-dashboard permission is never waiting: no call is made for them.
const isDeciding = computed(
  () => canReadOwn.value && (loading.value || !loaded.value),
)

onMounted(() => {
  if (!canReadOwn.value) return
  void fetchMyDashboard()
})
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="isDeciding"
      class="space-y-4"
    >
      <Skeleton class="h-24 w-full" />
      <div class="grid gap-4 lg:grid-cols-2">
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full" />
      </div>
    </div>

    <template v-else>
      <!-- A failed personal load must not hide the school dashboard from
           someone entitled to it, so this is a notice rather than a takeover. -->
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

      <!-- One panel: no tab strip. A single tab is a control that does nothing. -->
      <template v-else-if="panels.length === 1">
        <StudentDashboard
          v-if="student"
          :data="student"
          :is-weekly-holiday="isWeeklyHoliday"
        />
        <TeacherDashboard
          v-else-if="teacher"
          :data="teacher"
          :is-weekly-holiday="isWeeklyHoliday"
        />
        <DashboardView v-else />
      </template>

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
          />
        </TabsContent>
        <TabsContent
          v-if="canReadInstitution"
          value="institution"
          class="mt-4"
        >
          <DashboardView />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
