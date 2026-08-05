/**
 * One choice in a filter dropdown or select. Shared because the same
 * `{ value, label }` pair backs every filter bar across the apps.
 */
export interface FilterOption {
  value: string
  label: string
}
