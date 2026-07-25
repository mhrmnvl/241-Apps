import type { ImportColumnDescriptor } from '@/features/academic/shared/import-preview'

export const teacherImportColumns: ImportColumnDescriptor[] = [
  { key: 'nik', header: 'NIK', align: 'center', messageLabel: 'NIK' },
  { key: 'nip', header: 'NIP', align: 'center', messageLabel: 'NIP' },
  { key: 'nuptk', header: 'NUPTK', align: 'center', messageLabel: 'NUPTK' },
  {
    key: 'name',
    header: 'Nama',
    align: 'left',
    errorAliases: ['name', 'nama'],
    messageLabel: 'nama',
  },
  {
    key: 'gender',
    header: 'Jenis Kelamin',
    align: 'left',
    errorAliases: ['gender', 'jenis kelamin'],
    messageLabel: 'jenis kelamin',
    valueMap: { MALE: 'Laki-laki', FEMALE: 'Perempuan' },
  },
  {
    key: 'birthPlace',
    header: 'Tempat Lahir',
    align: 'left',
    errorAliases: ['birthPlace', 'tempat lahir'],
    messageLabel: 'tempat lahir',
  },
  {
    key: 'birthDate',
    header: 'Tanggal Lahir',
    align: 'center',
    errorAliases: ['birthDate', 'tanggal lahir'],
    messageLabel: 'tanggal lahir',
  },
  { key: 'email', header: 'Email', align: 'left', messageLabel: 'email' },
  {
    key: 'phone',
    header: 'No. Telepon',
    align: 'center',
    errorAliases: ['phone', 'telepon', 'nomor telepon'],
    messageLabel: 'nomor telepon',
  },
  {
    key: 'employmentTypeCode',
    header: 'Status',
    align: 'center',
    errorAliases: ['employment'],
  },
]
