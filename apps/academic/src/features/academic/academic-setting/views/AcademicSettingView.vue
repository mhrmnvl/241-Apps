<script setup lang="ts">
import { onMounted } from 'vue'
import { useAcademicSetting } from '../composables/useAcademicSetting'
import WeeklyHolidaysSection from '../components/WeeklyHolidaysSection.vue'
import PassingScoreSection from '../components/PassingScoreSection.vue'
import { Separator } from '@/ui/separator'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Alert, AlertDescription } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Loader2 } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'

const setting = useAcademicSetting()
const { can } = useRoleGuard()

onMounted(() => {
  void setting.fetch()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2.5">
            <CardTitle class="text-2xl font-bold tracking-tight">
              Pengaturan Akademik
            </CardTitle>
            <Badge
              v-if="setting.isDirty.value"
              variant="outline"
              class="text-xs font-semibold text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400"
            >
              Belum disimpan
            </Badge>
          </div>
        </div>

        <div
          v-if="can('academic-settings.update')"
          class="flex items-center gap-2 w-full sm:w-auto justify-end"
        >
          <Button
            v-if="setting.isDirty.value"
            type="button"
            variant="outline"
            size="sm"
            class="h-9"
            :disabled="setting.isSaving.value"
            @click="setting.reset"
          >
            Batalkan
          </Button>
          <Button
            type="button"
            size="sm"
            class="h-9"
            :disabled="
              !setting.isDirty.value ||
              !setting.isValid.value ||
              setting.isSaving.value
            "
            @click="setting.save"
          >
            <Loader2
              v-if="setting.isSaving.value"
              class="size-4 mr-1.5 animate-spin"
            />
            {{ setting.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </CardHeader>

      <div class="p-6 md:p-8 space-y-6">
        <!-- Loading State -->
        <div
          v-if="setting.loading.value"
          class="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground"
        >
          <Loader2 class="size-6 animate-spin text-primary" />
          <span class="text-sm font-medium">Memuat pengaturan akademik...</span>
        </div>

        <!-- Load Error State -->
        <Alert
          v-else-if="setting.loadError.value"
          variant="destructive"
        >
          <AlertDescription>{{ setting.loadError.value }}</AlertDescription>
        </Alert>

        <!-- Settings Content -->
        <template v-else>
          <WeeklyHolidaysSection
            :draft="setting.draftHolidays.value"
            :is-saving="setting.isSaving.value"
            :can-edit="can('academic-settings.update')"
            @toggle="setting.toggleHoliday"
          />

          <Separator />

          <PassingScoreSection
            :score="setting.draftPassingScore.value"
            :is-saving="setting.isSaving.value"
            :can-edit="can('academic-settings.update')"
            @update="setting.setPassingScore"
          />

          <!-- One record, one save, so a failure belongs to the page rather
               than to whichever section was touched last. -->
          <Alert
            v-if="setting.formError.value"
            variant="destructive"
          >
            <AlertDescription>{{ setting.formError.value }}</AlertDescription>
          </Alert>
        </template>
      </div>
    </Card>
  </div>
</template>
