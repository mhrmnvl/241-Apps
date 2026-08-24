<script setup lang="ts">
import { onMounted } from 'vue'
import { useAcademicSetting } from '../composables/useAcademicSetting'
import AcademicSettingCard from '../components/AcademicSettingCard.vue'
import PassingScoreSection from '../components/PassingScoreSection.vue'
import { useRoleGuard } from '@/features/platform/auth'

/**
 * The mark the school passes at, when the curriculum does not say otherwise.
 *
 * Read by more than this screen — the promotion table colours an average
 * against it — so it is worth being able to reach on its own rather than
 * through a page about something else.
 */
const setting = useAcademicSetting()
const { can } = useRoleGuard()

onMounted(() => {
  void setting.fetch()
})
</script>

<template>
  <AcademicSettingCard
    title="Nilai Ketuntasan Minimum (KKM)"
    :setting="setting"
    loading-text="Memuat nilai ketuntasan minimum..."
  >
    <PassingScoreSection
      :score="setting.draftPassingScore.value"
      :is-saving="setting.isSaving.value"
      :can-edit="can('academic-settings.update')"
      @update="setting.setPassingScore"
    />
  </AcademicSettingCard>
</template>
