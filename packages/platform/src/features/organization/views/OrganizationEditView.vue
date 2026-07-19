<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import OrganizationInfoForm from '../components/OrganizationInfoForm.vue'
import { useOrganization } from '../composables/useOrganization'
import { editBreadcrumbs } from '../constants'

const router = useRouter()

const {
  draftOrganization,
  organizationFormError,
  isSaving,
  loadOrganizationData,
  initializeEditForm,
  saveOrganizationInfo,
} = useOrganization()

onMounted(async () => {
  await loadOrganizationData()
  initializeEditForm()
})

const handleSaveOrganization = async () => {
  await saveOrganizationInfo()
  if (!organizationFormError.value) {
    void router.push('/organization')
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="editBreadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Ubah Data Yayasan
          </CardTitle>
          <Button
            variant="outline"
            @click="router.push('/organization')"
          >
            Batal
          </Button>
        </CardHeader>

        <OrganizationInfoForm
          :draft-organization="draftOrganization"
          :form-error="organizationFormError"
          :is-saving="isSaving"
          @save="handleSaveOrganization"
          @update:draft-organization="
            (val) => Object.assign(draftOrganization, val)
          "
        />
      </Card>
    </div>
  </AppLayout>
</template>
