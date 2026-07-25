import type { ImportColumnDescriptor } from '@/features/academic/shared/import-preview'

export const studentImportColumns: ImportColumnDescriptor[] = [
  { key: 'nis', header: 'NIS', align: 'center', messageLabel: 'NIS' },
  { key: 'nisn', header: 'NISN', align: 'center', messageLabel: 'NISN' },
  {
    key: 'name',
    header: 'Nama',
    align: 'left',
    errorAliases: ['name', 'nama'],
    messageLabel: 'nama',
  },
  { key: 'nik', header: 'NIK', align: 'center', messageLabel: 'NIK' },
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
  { key: 'grade', header: 'Tingkat', align: 'center' },
  {
    key: 'classroomCode',
    header: 'Kelas',
    align: 'center',
    errorAliases: ['classroom'],
  },
]
