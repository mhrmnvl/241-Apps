export type ImportRowStatus = 'SUCCESS' | 'FAILED' | 'CONFLICT'

export interface ImportPreviewRow<TData = Record<string, unknown>> {
  row: number
  status: ImportRowStatus
  identifier?: string
  error?: string
  existingId?: string
  data?: TData
}

export interface ImportColumnDescriptor {
  /** Key looked up on the row's `data` object. */
  key: string
  header: string
  align: 'left' | 'center'
  /**
   * Terms searched for in the formatted error message to decide whether this
   * column should show an error tooltip. Defaults to `[key]`.
   */
  errorAliases?: string[]
  /**
   * Word substituted in place of the raw backend field key inside the
   * formatted error message (e.g. `nis` -> `NIS`). Domain vocabulary, kept
   * separate from `errorAliases` which only affects error-to-column matching.
   */
  messageLabel?: string
  /** Display-value translation, e.g. `{ MALE: 'Laki-laki', FEMALE: 'Perempuan' }`. */
  valueMap?: Record<string, string>
}

export interface ImportResolveDecision<TData = Record<string, unknown>> {
  existingId?: string
  action: 'update' | 'skip'
  data: TData
}
