import { describe, it, expect, vi } from 'vitest'
import { useMultiStepForm } from './useMultiStepForm'

const steps = [
  { value: 1, title: 'Profil' },
  { value: 2, title: 'Akademik' },
  { value: 3, title: 'Alamat' },
  { value: 4, title: 'Orang Tua' },
  { value: 5, title: 'Ringkasan' },
]

function setup(validResult: Record<string, boolean>) {
  const validateField = vi.fn((field: string) =>
    Promise.resolve({ valid: validResult[field] ?? true }),
  )
  const onCancel = vi.fn()
  const form = useMultiStepForm({
    steps,
    validateField,
    gates: [
      { fields: ['name', 'nik'], unlocksStep: 2 },
      { fields: ['nis'], unlocksStep: 3 },
    ],
    onCancel,
  })
  return { form, validateField, onCancel }
}

describe('useMultiStepForm', () => {
  it('starts on step 1, not submitting', () => {
    const { form } = setup({})
    expect(form.activeStep.value).toBe(1)
    expect(form.submitting.value).toBe(false)
  })

  it('always allows moving backward without validation', async () => {
    const { form, validateField } = setup({})
    form.activeStep.value = 3
    await form.goToStep(1)
    expect(form.activeStep.value).toBe(1)
    expect(validateField).not.toHaveBeenCalled()
  })

  it('advances when all gates up to the target pass', async () => {
    const { form } = setup({})
    await form.goToStep(2)
    expect(form.activeStep.value).toBe(2)
  })

  it('lands on the step before the first failing gate', async () => {
    const { form } = setup({ name: false })
    await form.goToStep(3)
    expect(form.activeStep.value).toBe(1)
  })

  it('only checks gates that unlock at or before the target step', async () => {
    const { form, validateField } = setup({ nis: false })
    await form.goToStep(2)
    expect(form.activeStep.value).toBe(2)
    expect(validateField).not.toHaveBeenCalledWith('nis')
  })

  it('validateAllGates checks every gate regardless of current step', async () => {
    const { form } = setup({ nis: false })
    const result = await form.validateAllGates()
    expect(result).toBe(false)
    expect(form.activeStep.value).toBe(2)
  })

  it('validateAllGates returns true when every gate passes', async () => {
    const { form } = setup({})
    const result = await form.validateAllGates()
    expect(result).toBe(true)
  })

  it('back() calls onCancel on step 1', () => {
    const { form, onCancel } = setup({})
    form.back()
    expect(onCancel).toHaveBeenCalled()
    expect(form.activeStep.value).toBe(1)
  })

  it('back() decrements the step when not on step 1', () => {
    const { form, onCancel } = setup({})
    form.activeStep.value = 3
    form.back()
    expect(form.activeStep.value).toBe(2)
    expect(onCancel).not.toHaveBeenCalled()
  })

  describe('mobileVisibleStepValues', () => {
    it('shows the first three steps near the start', () => {
      const { form } = setup({})
      form.activeStep.value = 1
      expect(form.mobileVisibleStepValues.value).toEqual([1, 2, 3])
    })

    it('shows the last three steps near the end', () => {
      const { form } = setup({})
      form.activeStep.value = 5
      expect(form.mobileVisibleStepValues.value).toEqual([3, 4, 5])
    })

    it('centers on the active step in the middle', () => {
      const { form } = setup({})
      form.activeStep.value = 3
      expect(form.mobileVisibleStepValues.value).toEqual([2, 3, 4])
    })
  })
})
