<script setup lang="ts">
import { computed } from 'vue'
import { DataTable } from '@/ui'
import { useAchievement } from '../composables/useAchievement'
import { createAchievementColumns } from './columns'
import type { Achievement, AchievementTabData } from '../types'

const props = defineProps<{ data: AchievementTabData; isAdmin?: boolean }>()
const emit = defineEmits<{ edit: [item: Achievement]; reload: [] }>()

const { deleteAchievement } = useAchievement()

const achievements = computed(() => props.data.achievements ?? [])

const columns = computed(() => {
  return createAchievementColumns(props.isAdmin || false, {
    onEdit: (item) => emit('edit', item),
    onDelete: (id, setLoading, closeAlert) => {
      void (async () => {
        setLoading(true)
        const { success } = await deleteAchievement(id)
        if (success) {
          emit('reload')
          closeAlert()
        } else {
          setLoading(false)
        }
      })()
    },
  })
})
</script>

<template>
  <div class="py-4">
    <div v-if="achievements.length > 0">
      <DataTable
        :columns="columns"
        :data="achievements"
        :total-items="achievements.length"
        item-label="prestasi"
        :hide-per-page="true"
        :hide-pagination="true"
      />
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">
        Belum ada catatan prestasi sejauh ini.
      </p>
    </div>
  </div>
</template>
