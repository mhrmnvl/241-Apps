<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from '@/ui/stepper'
import { AddressFields } from '@/features/academic/shared/multi-step-form'
import { useStudentCreateForm } from '../composables/useStudentCreateForm'
import StudentProfileStep from '../components/create/StudentProfileStep.vue'
import StudentAcademicStep from '../components/create/StudentAcademicStep.vue'
import StudentParentStep from '../components/create/StudentParentStep.vue'
import StudentReviewStep from '../components/create/StudentReviewStep.vue'

const breadcrumbs = [
  { title: 'Siswa', href: '/student' },
  { title: 'Tambah Siswa' },
]

const {
  steps,
  activeStep,
  submitting,
  mobileVisibleStepValues,
  goToStep,
  next,
  back,
  values,
  setFieldValue,
  address,
  hasAddress,
  parents,
  addParent,
  removeParent,
  grades,
  filteredClassrooms,
  occupations,
  incomeOptions,
  relationOptions,
  submit,
} = useStudentCreateForm()
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0"
      >
        <CardHeader class="border-b px-6 pt-5! pb-5!">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tambah Siswa Baru
          </CardTitle>
        </CardHeader>

        <div class="px-6 py-4 border-b">
          <Stepper
            :model-value="activeStep"
            class="flex items-center justify-center gap-1 sm:gap-2 w-full max-w-md mx-auto"
            @update:model-value="(v) => void goToStep(Number(v))"
          >
            <StepperItem
              v-for="step in steps"
              :key="step.value"
              :step="step.value"
              class="flex items-center gap-1 sm:gap-2 group transition-all duration-300"
              :class="{
                'hidden sm:flex': !mobileVisibleStepValues.includes(step.value),
              }"
            >
              <StepperTrigger
                class="flex items-center gap-1 sm:gap-2 cursor-pointer outline-none shrink-0"
              >
                <StepperIndicator class="shrink-0">
                  <Check
                    v-if="activeStep > step.value"
                    class="size-4"
                  />
                  <span v-else>{{ step.value }}</span>
                </StepperIndicator>
              </StepperTrigger>
              <StepperSeparator
                v-if="step.value < steps.length"
                class="w-3 sm:w-10 h-0.5 bg-muted transition-all duration-300"
                :class="{
                  'hidden sm:block': !(
                    mobileVisibleStepValues.includes(step.value) &&
                    mobileVisibleStepValues.includes(step.value + 1)
                  ),
                }"
              />
            </StepperItem>
          </Stepper>

          <div class="mt-3 text-center">
            <span
              class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Langkah {{ activeStep }} dari {{ steps.length }}
            </span>
            <p class="text-sm font-bold text-foreground">
              {{ steps.find((s) => s.value === activeStep)?.title }}
            </p>
          </div>
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          <div class="px-6 py-5">
            <StudentProfileStep v-show="activeStep === 1" />

            <StudentAcademicStep
              v-show="activeStep === 2"
              :grades="grades"
              :filtered-classrooms="filteredClassrooms"
              :set-field-value="setFieldValue"
            />

            <div v-if="activeStep === 3">
              <AddressFields v-model="address" />
            </div>

            <StudentParentStep
              v-if="activeStep === 4"
              :parents="parents"
              :occupations="occupations"
              :relation-options="relationOptions"
              :income-options="incomeOptions"
              @add-parent="addParent"
              @remove-parent="removeParent"
            />

            <StudentReviewStep
              v-if="activeStep === 5"
              :values="values"
              :address="address"
              :has-address="hasAddress"
              :parents="parents"
            />
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t px-6 py-4 bg-background"
        >
          <Button
            variant="outline"
            :disabled="submitting"
            @click="back"
          >
            {{ activeStep === 1 ? 'Batal' : 'Kembali' }}
          </Button>
          <Button
            v-if="activeStep < 5"
            @click="next"
          >
            Lanjut
          </Button>
          <Button
            v-else
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Siswa' }}
          </Button>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
