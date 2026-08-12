import { computed } from 'vue'

/**
 * Edits one `YYYY-MM-DDTHH:mm` value through the two controls that make it up:
 * a DatePicker for the date and a time Input for the clock.
 *
 * The halves cannot simply be concatenated, because either control can be
 * cleared and a cleared time yields `2026-08-12T` — a value strictly worse
 * than an empty one. It has a non-zero length, so a `startTime.length > 0`
 * guard reads it as filled; it parses to an Invalid Date, so comparing it
 * against another date is silently `false` and reports no range error; and
 * `new Date(it).toISOString()` throws `RangeError` when the form is submitted.
 *
 * So the value is kept whole or empty: no date means empty, and a missing
 * time falls back to `defaultTime`.
 *
 * Takes a getter and setter rather than a `Ref` because the callers hold their
 * field inside a form object they replace wholesale when loading an existing
 * record — a `toRef` would keep pointing at the discarded one.
 */
export function useDateTimeParts(
  read: () => string,
  write: (value: string) => void,
  defaultTime: string,
) {
  function split(value: string) {
    const [date = '', time = ''] = value.split('T')
    return { date, time }
  }

  function join(date: string, time: string) {
    if (date.length === 0) {
      write('')
      return
    }
    write(`${date}T${time.length > 0 ? time : defaultTime}`)
  }

  const date = computed({
    get: () => split(read()).date,
    set: (next: string) => join(next, split(read()).time),
  })

  const time = computed({
    get: () => {
      const current = split(read()).time
      return current.length > 0 ? current : defaultTime
    },
    set: (next: string) => join(split(read()).date, next),
  })

  return { date, time }
}
