export const WEEK_DAYS: { value: string; label: string; short: string }[] = [
  { value: 'MONDAY', label: 'Senin', short: 'Sen' },
  { value: 'TUESDAY', label: 'Selasa', short: 'Sel' },
  { value: 'WEDNESDAY', label: 'Rabu', short: 'Rab' },
  { value: 'THURSDAY', label: 'Kamis', short: 'Kam' },
  { value: 'FRIDAY', label: 'Jumat', short: 'Jum' },
  { value: 'SATURDAY', label: 'Sabtu', short: 'Sab' },
]

export function dayShortLabel(day: string): string {
  return WEEK_DAYS.find((d) => d.value === day)?.short ?? day
}
