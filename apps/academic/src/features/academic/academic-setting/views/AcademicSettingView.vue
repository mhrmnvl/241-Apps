<script setup lang="ts">
import { onMounted } from 'vue'
import { useAcademicSetting } from '../composables/useAcademicSetting'
import { WEEKDAYS, formatWeeklyHolidays } from '../constants/weekdays'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Alert, AlertDescription } from '@/ui/alert'
import { AlertCircle, CalendarOff, Loader2 } from 'lucide-vue-next'

const setting = useAcademicSetting()

onMounted(() => {
  void setting.fetch()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-lg font-semibold text-foreground">Pengaturan Akademik</h1>
      <p class="text-sm text-muted-foreground">
        Aturan yang berlaku untuk seluruh sekolah, bukan untuk satu tahun ajaran
        saja.
      </p>
    </div>

    <Card class="rounded-xl shadow-xs py-0 max-w-2xl">
      <CardHeader
        class="flex flex-row items-center gap-2.5 border-b px-5 py-3.5"
      >
        <CalendarOff class="size-4 text-primary shrink-0" />
        <CardTitle class="text-sm font-semibold tracking-normal">
          Hari Libur Mingguan
        </CardTitle>
      </CardHeader>

      <CardContent class="p-5 space-y-4">
        <div
          v-if="setting.loading.value"
          class="flex items-center gap-2 py-6 text-sm text-muted-foreground"
        >
          <Loader2 class="size-4 animate-spin" />
          Memuat pengaturan...
        </div>

        <Alert
          v-else-if="setting.loadError.value"
          variant="destructive"
        >
          <AlertCircle class="size-4" />
          <AlertDescription>{{ setting.loadError.value }}</AlertDescription>
        </Alert>

        <template v-else>
          <p class="text-sm text-muted-foreground">
            Pilih hari yang sekolah tidak berjalan. Hari ini ditandai libur di
            kalender pendidikan tanpa perlu dicatat satu per satu.
          </p>

          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="day in WEEKDAYS"
              :key="day.value"
              type="button"
              size="sm"
              class="w-14"
              :variant="
                setting.draft.value.includes(day.value) ? 'default' : 'outline'
              "
              :disabled="setting.isSaving.value"
              :aria-pressed="setting.draft.value.includes(day.value)"
              :aria-label="`${day.label} libur`"
              @click="setting.toggle(day.value)"
            >
              {{ day.short }}
            </Button>
          </div>

          <p class="text-sm">
            <span class="text-muted-foreground">Libur:</span>
            <span class="font-medium text-foreground">
              {{ formatWeeklyHolidays(setting.draft.value) }}
            </span>
          </p>

          <Alert
            v-if="setting.formError.value"
            variant="destructive"
          >
            <AlertCircle class="size-4" />
            <AlertDescription>{{ setting.formError.value }}</AlertDescription>
          </Alert>

          <div class="flex gap-2 border-t pt-4">
            <Button
              type="button"
              :disabled="!setting.isDirty.value || setting.isSaving.value"
              @click="setting.save"
            >
              <Loader2
                v-if="setting.isSaving.value"
                class="size-4 animate-spin"
              />
              {{ setting.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
            </Button>
            <Button
              type="button"
              variant="outline"
              :disabled="!setting.isDirty.value || setting.isSaving.value"
              @click="setting.reset"
            >
              Batalkan Perubahan
            </Button>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
