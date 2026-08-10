/**
 * Shared pagination constants used across all features.
 *
 * Usage guide:
 * - `REFERENCE_LIMIT`   → fetch all data for dropdowns, selects, and reference lists
 * - `CHILD_ENTITY_LIMIT`→ fetch all sub-entities under a single parent (positions, history, etc.)
 * - `DEFAULT_PAGE_SIZE` → initial pageSize for server-side paginated tables
 */
export const PAGINATION = {
  /** Default rows per page for server-side paginated DataTable */
  DEFAULT_PAGE_SIZE: 10,

  /** Limit when fetching all reference data (dropdowns, comboboxes, filter options) */
  REFERENCE_LIMIT: 1000,

  /**
   * Limit when fetching child entities belonging to a single parent
   * (e.g. jabatan per guru, beasiswa per siswa, nilai per kelas)
   */
  CHILD_ENTITY_LIMIT: 500,
} as const
