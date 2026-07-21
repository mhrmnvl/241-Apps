<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'

defineProps<{
  isAdmin: boolean
  isTeacher: boolean
  selectedClassroomId: string
  options: ComboboxOption[]
}>()

const emit = defineEmits<{
  classroomChange: [classroomId: string]
}>()

function onClassroomChange(val: string | null) {
  if (val) {
    emit('classroomChange', val)
  }
}
</script>

<template>
  <Card
    class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
  >
    <CardHeader
      class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <CardTitle class="text-2xl font-bold tracking-tight">
          {{ isTeacher ? 'Jadwal Mengajar' : 'Jadwal Pelajaran' }}
        </CardTitle>
        <p class="text-sm text-muted-foreground mt-0.5">
          {{
            isTeacher
              ? 'Jadwal mengajar Anda selama seminggu'
              : 'Jadwal pelajaran per kelas selama seminggu'
          }}
        </p>
      </div>
      <div
        v-if="isAdmin"
        class="w-full sm:w-auto sm:min-w-[240px]"
      >
        <AppCombobox
          :model-value="selectedClassroomId"
          :options="options"
          placeholder="Pilih kelas..."
          search-placeholder="Cari kelas..."
          empty-text="Kelas tidak ditemukan."
          @update:model-value="onClassroomChange"
        />
      </div>
    </CardHeader>
  </Card>
</template>
