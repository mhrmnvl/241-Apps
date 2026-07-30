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
import { useTeacherCreateForm } from '../composables/useTeacherCreateForm'
import TeacherProfileStep from '../components/create/TeacherProfileStep.vue'
import TeacherEmploymentStep from '../components/create/TeacherEmploymentStep.vue'
import TeacherPositionStep from '../components/create/TeacherPositionStep.vue'
import TeacherReviewStep from '../components/create/TeacherReviewStep.vue'

const breadcrumbs = [
  { title: 'Guru', href: '/teacher' },
  { title: 'Tambah Guru' },
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
  kategori,
  categoryOptions,
  filteredPositions,
  address,
  hasAddress,
  extraPositions,
  addPosition,
  removePosition,
  employmentTypes,
  positions,
  submit,
} = useTeacherCreateForm()
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0"
      >
        <CardHeader class="border-b px-6 pt-5! pb-5!">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tambah Guru Baru
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
            <TeacherProfileStep v-show="activeStep === 1" />

            <TeacherEmploymentStep
              v-show="activeStep === 2"
              v-model:kategori="kategori"
              :employment-types="employmentTypes"
              :category-options="categoryOptions"
              :filtered-positions="filteredPositions"
              :set-field-value="setFieldValue"
            />

            <div v-if="activeStep === 3">
              <AddressFields v-model="address" />
            </div>

            <TeacherPositionStep
              v-if="activeStep === 4"
              :extra-positions="extraPositions"
              :positions="positions"
              @add-position="addPosition"
              @remove-position="removePosition"
            />

            <TeacherReviewStep
              v-if="activeStep === 5"
              :values="values"
              :address="address"
              :has-address="hasAddress"
              :extra-positions="extraPositions"
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
            {{ submitting ? 'Menyimpan...' : 'Simpan Guru' }}
          </Button>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
