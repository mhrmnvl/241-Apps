import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useDateTimeParts } from './useDateTimeParts'

function setup(initial = '', defaultTime = '08:00') {
  const source = ref(initial)
  const parts = useDateTimeParts(
    () => source.value,
    (value) => {
      source.value = value
    },
    defaultTime,
  )
  return { source, ...parts }
}

describe('useDateTimeParts', () => {
  it('splits a whole value into the halves each control edits', () => {
    const { date, time } = setup('2026-08-12T09:30')

    expect(date.value).toBe('2026-08-12')
    expect(time.value).toBe('09:30')
  })

  it('shows the default time while no value has been chosen', () => {
    const { date, time } = setup('')

    expect(date.value).toBe('')
    expect(time.value).toBe('08:00')
  })

  it('pairs a newly picked date with the default time', () => {
    const { source, date } = setup('')

    date.value = '2026-08-12'

    expect(source.value).toBe('2026-08-12T08:00')
  })

  it('keeps the time when only the date changes', () => {
    const { source, date } = setup('2026-08-12T09:30')

    date.value = '2026-08-13'

    expect(source.value).toBe('2026-08-13T09:30')
  })

  it('empties the whole value when the date is cleared', () => {
    const { source, date } = setup('2026-08-12T09:30')

    date.value = ''

    expect(source.value).toBe('')
  })

  // The reason this composable exists. A cleared time input used to write
  // `2026-08-12T`, which reads as filled to a length check, compares as an
  // Invalid Date without raising a range error, and throws on submit.
  it('never writes a date with a missing time', () => {
    const { source, time } = setup('2026-08-12T09:30')

    time.value = ''

    expect(source.value).toBe('2026-08-12T08:00')
    expect(source.value.endsWith('T')).toBe(false)
  })

  it('leaves a value that submission can always convert', () => {
    const { source, date, time } = setup('', '23:59')

    date.value = '2026-08-12'
    time.value = ''

    expect(() => new Date(source.value).toISOString()).not.toThrow()
    expect(Number.isNaN(new Date(source.value).getTime())).toBe(false)
  })
})
