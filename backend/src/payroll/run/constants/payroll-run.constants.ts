/** Every refusal below is its own message: a generic failure tells the operator nothing. */
export const RUN_MESSAGES = {
  PERIOD_NOT_CLOSED: 'Periode kehadiran belum ditutup',
  ORIGINAL_EXISTS:
    'Run ORIGINAL untuk periode ini sudah ada — buat adjustment run',
  ORIGINAL_MISSING:
    'Belum ada run ORIGINAL untuk periode ini — adjustment tidak berlaku',
  APPROVED_TERMINAL: 'Run sudah disetujui — gunakan adjustment run',
  DRAFT_ONLY: 'Hanya run berstatus DRAFT yang bisa dihitung ulang',
  SUBMIT_FROM_DRAFT: 'Hanya run berstatus DRAFT yang bisa diajukan',
  APPROVE_FROM_SUBMITTED: 'Hanya run berstatus SUBMITTED yang bisa disetujui',
  /**
   * No override permission exists in the catalog, so this is a flat refusal.
   * The role split already separates the two — TU creates, Kepala Sekolah
   * approves — and inventing a code nothing seeds would be worse than saying no.
   */
  SELF_APPROVAL: 'Run tidak bisa disetujui oleh pembuatnya sendiri',
  NOT_FOUND: 'Payroll run tidak ditemukan',
  EMPTY_ROSTER: 'Tidak ada pegawai aktif untuk periode ini',
} as const;

export const RUN_AUDIT_RESOURCE = 'payroll_run';
