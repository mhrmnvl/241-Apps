/** Every refusal below is its own message: a generic failure tells the operator nothing. */
export const RUN_MESSAGES = {
  PERIOD_NOT_CLOSED: 'The attendance period has not been closed',
  ORIGINAL_EXISTS:
    'An ORIGINAL run already exists for this period. Create an adjustment run instead.',
  ORIGINAL_MISSING:
    'No ORIGINAL run exists for this period, so an adjustment does not apply',
  APPROVED_TERMINAL:
    'The run is already approved. Use an adjustment run instead.',
  DRAFT_ONLY: 'Only a DRAFT run can be recalculated',
  SUBMIT_FROM_DRAFT: 'Only a DRAFT run can be submitted',
  APPROVE_FROM_SUBMITTED: 'Only a SUBMITTED run can be approved',
  /**
   * No override permission exists in the catalog, so this is a flat refusal.
   * The role split already separates the two — TU creates, Kepala Sekolah
   * approves — and inventing a code nothing seeds would be worse than saying no.
   */
  SELF_APPROVAL: 'A run cannot be approved by the person who created it',
  NOT_FOUND: 'Payroll run not found',
  EMPTY_ROSTER: 'No active employees for this period',
} as const;

export const RUN_AUDIT_RESOURCE = 'payroll_run';
