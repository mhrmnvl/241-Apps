import { computed, ref } from 'vue'
import type { StepGate, WizardStep } from '../types'

export interface UseMultiStepFormOptions<TField> {
  steps: WizardStep[]
  validateField: (field: TField) => Promise<{ valid: boolean }>
  gates: StepGate<TField>[]
  onCancel: () => void
}

export function useMultiStepForm<TField>(
  options: UseMultiStepFormOptions<TField>,
) {
  const { steps, validateField, gates, onCancel } = options

  const activeStep = ref(1)
  const submitting = ref(false)

  const mobileVisibleStepValues = computed(() => {
    if (activeStep.value <= 2) return [1, 2, 3]
    if (activeStep.value >= steps.length - 1)
      return [steps.length - 2, steps.length - 1, steps.length]
    return [activeStep.value - 1, activeStep.value, activeStep.value + 1]
  })

  async function validateFields(fields: TField[]): Promise<boolean> {
    const results = await Promise.all(fields.map((f) => validateField(f)))
    return results.every((r) => r.valid)
  }

  async function firstFailingGateStep(target: number): Promise<number | null> {
    for (const gate of gates) {
      if (gate.unlocksStep > target) continue
      if (!(await validateFields(gate.fields))) {
        return gate.unlocksStep - 1
      }
    }
    return null
  }

  async function goToStep(target: number) {
    if (target <= activeStep.value) {
      activeStep.value = target
      return
    }
    const failedAt = await firstFailingGateStep(target)
    if (failedAt !== null) {
      activeStep.value = failedAt
      return
    }
    activeStep.value = target
  }

  function next() {
    void goToStep(activeStep.value + 1)
  }

  function back() {
    if (activeStep.value === 1) {
      onCancel()
      return
    }
    activeStep.value -= 1
  }

  async function validateAllGates(): Promise<boolean> {
    const failedAt = await firstFailingGateStep(steps.length)
    if (failedAt !== null) {
      activeStep.value = failedAt
      return false
    }
    return true
  }

  return {
    activeStep,
    submitting,
    mobileVisibleStepValues,
    validateFields,
    goToStep,
    next,
    back,
    validateAllGates,
  }
}
