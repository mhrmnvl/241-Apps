import type { ColumnDef } from '@tanstack/vue-table'
import type { WorkPatternAssignment } from '../types'

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function createCurrentAssignmentColumns(): ColumnDef<WorkPatternAssignment>[] {
  return [
    {
      id: 'holder',
      header: 'Pegawai',
      meta: { align: 'left' },
      cell: ({ row }) =>
        row.original.holder.displayName ?? row.original.holder.identifier,
    },
    {
      id: 'patternName',
      header: 'Pola Kerja',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.patternName,
    },
    {
      id: 'effectiveFrom',
      header: 'Berlaku Mulai',
      meta: { align: 'center' },
      cell: ({ row }) => formatDate(row.original.effectiveFrom),
    },
  ]
}

export function createHistoryAssignmentColumns(): ColumnDef<WorkPatternAssignment>[] {
  return [
    {
      id: 'holder',
      header: 'Pegawai',
      meta: { align: 'left' },
      cell: ({ row }) =>
        row.original.holder.displayName ?? row.original.holder.identifier,
    },
    {
      id: 'patternName',
      header: 'Pola Kerja',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.patternName,
    },
    {
      id: 'effectiveFrom',
      header: 'Tgl Mulai',
      meta: { align: 'center' },
      cell: ({ row }) => formatDate(row.original.effectiveFrom),
    },
    {
      id: 'effectiveTo',
      header: 'Tgl Selesai',
      meta: { align: 'center' },
      cell: ({ row }) =>
        row.original.effectiveTo ? formatDate(row.original.effectiveTo) : '—',
    },
  ]
}
