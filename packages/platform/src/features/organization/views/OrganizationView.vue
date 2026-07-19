<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import OrganizationDetailCard from '../components/OrganizationDetailCard.vue'
import { useOrganization } from '../composables/useOrganization'
import { breadcrumbs } from '../constants'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { PencilLine, Plus, School } from 'lucide-vue-next'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

// Import school unit components/api
import SchoolUnitInfoForm from '@/features/platform/school-unit/components/SchoolUnitInfoForm.vue'
import { schoolUnitApi } from '@/features/platform/school-unit/api/schoolUnitApi'
import { EMPTY_SCHOOL_UNIT } from '@/features/platform/school-unit/constants'
import type { SchoolUnitProfile } from '@/features/platform/school-unit/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'

const router = useRouter()
const { isAdmin } = useRoleGuard()

const { organization, isLoading, loadError, loadOrganizationData } =
  useOrganization()

const isAddSheetOpen = ref(false)
const isSavingNewSchool = ref(false)
const addSchoolError = ref<string | null>(null)
const draftNewSchool = ref<SchoolUnitProfile>({ ...EMPTY_SCHOOL_UNIT })

onMounted(() => {
  void loadOrganizationData()
})

const handleAddClick = () => {
  draftNewSchool.value = { ...EMPTY_SCHOOL_UNIT }
  addSchoolError.value = null
  isAddSheetOpen.value = true
}

const handleSaveNewSchool = async () => {
  isSavingNewSchool.value = true
  addSchoolError.value = null
  try {
    await schoolUnitApi.createSchoolUnit(draftNewSchool.value)
    toast.success('Unit sekolah baru berhasil ditambahkan.')
    isAddSheetOpen.value = false
    await loadOrganizationData()
  } catch (error: unknown) {
    const errorMsg = getIndonesianErrorMessage(
      error,
      'Gagal menambahkan unit sekolah baru.',
    )
    addSchoolError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSavingNewSchool.value = false
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8 space-y-6">
      <!-- Yayasan Card -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Profil Yayasan
          </CardTitle>
          <Button
            v-if="isAdmin"
            :disabled="isLoading || Boolean(loadError)"
            @click="router.push('/organization/edit')"
          >
            <PencilLine class="size-4 mr-2" />
            Ubah Data
          </Button>
        </CardHeader>

        <OrganizationDetailCard
          :organization="organization"
          :is-loading="isLoading"
          :load-error="loadError"
        />
      </Card>

      <!-- School Units Card -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Daftar Unit Sekolah
          </CardTitle>
          <Button
            v-if="isAdmin"
            :disabled="isLoading || Boolean(loadError)"
            @click="handleAddClick"
          >
            <Plus class="size-4 mr-2" />
            Tambah Unit Sekolah
          </Button>
        </CardHeader>

        <div class="p-6">
          <div
            v-if="isLoading"
            class="py-12 text-center text-sm text-muted-foreground"
          >
            Memuat daftar unit sekolah...
          </div>
          <div
            v-else-if="
              !organization.schoolUnits || organization.schoolUnits.length === 0
            "
            class="rounded-xl border border-dashed p-12 text-center"
          >
            <div class="flex justify-center mb-3">
              <div class="p-3 rounded-full bg-primary/10 text-primary">
                <School class="size-6" />
              </div>
            </div>
            <h3 class="text-sm font-semibold text-foreground mb-1">
              Belum Ada Unit Sekolah
            </h3>
            <p class="text-xs text-muted-foreground max-w-sm mx-auto">
              Belum ada unit sekolah yang terdaftar di bawah yayasan ini.
              Silakan tambahkan unit sekolah baru.
            </p>
          </div>
          <div
            v-else
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="school in organization.schoolUnits"
              :key="school.id"
              class="relative flex flex-col justify-between rounded-xl border bg-background p-5 hover:shadow-md transition-all duration-300 group"
            >
              <div>
                <div class="flex items-start justify-between gap-3 mb-3">
                  <h4
                    class="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors"
                  >
                    {{ school.name }}
                  </h4>
                  <div
                    class="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    <School class="size-4" />
                  </div>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-4">
                  <Badge
                    variant="secondary"
                    class="text-[10px] py-0.5 px-2 font-semibold"
                  >
                    {{ school.type }}
                  </Badge>
                  <Badge
                    :variant="
                      school.status === 'PUBLIC' ? 'default' : 'outline'
                    "
                    class="text-[10px] py-0.5 px-2 font-semibold"
                  >
                    {{ school.status === 'PUBLIC' ? 'Negeri' : 'Swasta' }}
                  </Badge>
                </div>

                <div
                  class="space-y-1 text-xs text-muted-foreground border-t pt-3"
                >
                  <div class="flex justify-between">
                    <span>NPSN</span>
                    <span class="font-mono text-foreground">{{
                      school.npsn
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>NSM</span>
                    <span class="font-mono text-foreground">{{
                      school.nsm
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Sheet Add School Unit -->
      <Sheet v-model:open="isAddSheetOpen">
        <SheetContent
          class="w-full sm:max-w-xl flex flex-col gap-0 border-l p-0"
        >
          <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
            <SheetTitle>Tambah Unit Sekolah</SheetTitle>
            <SheetDescription>
              Masukkan informasi profil untuk unit sekolah baru di bawah yayasan
              ini.
            </SheetDescription>
          </SheetHeader>

          <div class="flex-1 overflow-y-auto">
            <SchoolUnitInfoForm
              :draft-school-unit="draftNewSchool"
              :form-error="addSchoolError"
              :is-saving="isSavingNewSchool"
              @save="handleSaveNewSchool"
              @update:draft-school-unit="
                (val) => Object.assign(draftNewSchool, val)
              "
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </AppLayout>
</template>
