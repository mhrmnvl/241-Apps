<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SchoolUnitDetailCard from '../components/SchoolUnitDetailCard.vue'
import { useSchoolUnit } from '../composables/useSchoolUnit'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { PencilLine } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'

const router = useRouter()
const { can } = useRoleGuard()

const {
  schoolUnit,
  address,
  isLoading,
  loadError,
  isNotSetUp,
  loadSchoolUnitData,
} = useSchoolUnit()

onMounted(() => {
  void loadSchoolUnitData()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 pt-5! pb-5! gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Profil Sekolah
          </CardTitle>
        </div>
        <Button
          v-if="can('school-units.create')"
          :disabled="isLoading || (Boolean(loadError) && !isNotSetUp)"
          @click="router.push('/school-unit/edit')"
        >
          <PencilLine class="size-4 mr-2" />
          Ubah Data
        </Button>
      </CardHeader>

      <SchoolUnitDetailCard
        :school-unit="schoolUnit"
        :address="address"
        :is-loading="isLoading"
        :load-error="loadError"
      />
    </Card>
  </div>
</template>
