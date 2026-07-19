<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/ui/stepper'
import { Check } from 'lucide-vue-next'
import SchoolUnitAddressForm from '../components/SchoolUnitAddressForm.vue'
import SchoolUnitInfoForm from '../components/SchoolUnitInfoForm.vue'
import { useSchoolUnit } from '../composables/useSchoolUnit'
import { editBreadcrumbs } from '../constants'

const router = useRouter()
const activeStep = ref(1)

const steps = [
  {
    value: 1,
    title: 'Informasi Lembaga',
  },
  {
    value: 2,
    title: 'Lokasi Lembaga',
  },
]

const {
  draftSchoolUnit,
  draftAddress,
  schoolUnitFormError,
  addressFormError,
  isSavingSchoolUnit,
  isSavingAddress,
  loadSchoolUnitData,
  initializeEditForm,
  saveSchoolUnitInfo,
  saveAddressInfo,
} = useSchoolUnit()

onMounted(async () => {
  await loadSchoolUnitData()
  initializeEditForm()
})

const handleSaveSchoolUnit = async () => {
  await saveSchoolUnitInfo()
  if (!schoolUnitFormError.value) {
    activeStep.value = 2
  }
}

const handleSaveAddress = async () => {
  await saveAddressInfo()
  if (!addressFormError.value) {
    void router.push('/school-unit')
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="editBreadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 pt-5! pb-5!"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Ubah Data Unit Sekolah
          </CardTitle>
        </CardHeader>

        <div class="w-full">
          <div class="px-6 py-3 border-b">
            <Stepper
              v-model="activeStep"
              class="flex items-center justify-center gap-4 md:gap-8 w-full max-w-2xl mx-auto"
            >
              <StepperItem
                v-for="step in steps"
                :key="step.value"
                :step="step.value"
                class="flex items-center gap-4 md:gap-8 group"
              >
                <StepperTrigger
                  class="flex items-center gap-3 cursor-pointer outline-none"
                >
                  <StepperIndicator class="shrink-0">
                    <Check
                      v-if="activeStep > step.value"
                      class="size-4"
                    />
                    <span v-else>{{ step.value }}</span>
                  </StepperIndicator>
                  <StepperTitle
                    class="text-sm font-semibold leading-none whitespace-nowrap"
                  >
                    {{ step.title }}
                  </StepperTitle>
                </StepperTrigger>
                <StepperSeparator
                  v-if="step.value < steps.length"
                  class="w-16 md:w-32 h-0.5 bg-muted"
                />
              </StepperItem>
            </Stepper>
          </div>

          <div
            v-if="activeStep === 1"
            class="mt-0 border-0 outline-none"
          >
            <SchoolUnitInfoForm
              :draft-school-unit="draftSchoolUnit"
              :form-error="schoolUnitFormError"
              :is-saving="isSavingSchoolUnit"
              @cancel="router.push('/school-unit')"
              @save="handleSaveSchoolUnit"
              @update:draft-school-unit="
                (val) => Object.assign(draftSchoolUnit, val)
              "
            />
          </div>

          <div
            v-if="activeStep === 2"
            class="mt-0 border-0 outline-none"
          >
            <SchoolUnitAddressForm
              :draft-address="draftAddress"
              :form-error="addressFormError"
              :is-saving="isSavingAddress"
              @cancel="activeStep = 1"
              @save="handleSaveAddress"
              @update:draft-address="(val) => Object.assign(draftAddress, val)"
            />
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
