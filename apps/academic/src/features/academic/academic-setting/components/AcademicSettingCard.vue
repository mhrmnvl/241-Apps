<script setup lang="ts">
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Alert, AlertDescription } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Loader2 } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'
import type { useAcademicSetting } from '../composables/useAcademicSetting'

/**
 * The frame the two academic settings share: title, dirty badge, save, reset,
 * and the loading and error states.
 *
 * They used to be two sections of one page and are now two menu entries, which
 * is the shape the school reaches for them in — nobody opens "Pengaturan
 * Akademik" to change which day is a holiday. What has not changed is that
 * they are one record on the server, so both screens fetch it, both save it
 * whole, and the field the screen does not show carries its stored value
 * through untouched.
 */
withDefaults(
  defineProps<{
    title: string
    setting: ReturnType<typeof useAcademicSetting>
    loadingText: string
    /** Hides the Simpan/Batalkan buttons in the card header. */
    hideControls?: boolean
  }>(),
  { hideControls: false },
)

const { can } = useRoleGuard()
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div class="flex items-center gap-2.5">
          <CardTitle class="text-2xl font-bold tracking-tight">
            {{ title }}
          </CardTitle>
          <Badge
            v-if="setting.isDirty.value"
            variant="outline"
            class="text-xs font-semibold text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400"
          >
            Belum disimpan
          </Badge>
        </div>

        <div
          v-if="!hideControls && can('academic-settings.update')"
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
        <div
          v-if="setting.loading.value"
          class="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground"
        >
          <Loader2 class="size-6 animate-spin text-primary" />
          <span class="text-sm font-medium">{{ loadingText }}</span>
        </div>

        <Alert
          v-else-if="setting.loadError.value"
          variant="destructive"
        >
          <AlertDescription>{{ setting.loadError.value }}</AlertDescription>
        </Alert>

        <template v-else>
          <slot />

          <!-- One record, one save, so a failure belongs to the page rather
               than to the control that was touched last. -->
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
