import { TeacherWithDetails } from '../domain/interfaces/teacher-repository.interface.js';

export function mapTeacherToExportRow(e: TeacherWithDetails) {
  return {
    Nama: e.user.profile?.name ?? '',
    NIK: e.user.profile?.nik ?? '',
    NIP: e.nip ?? '',
    NUPTK: e.nuptk ?? '',
    'Status Kepegawaian': e.employmentType?.name ?? '',
    'Jenis Kelamin':
      e.user.profile?.gender === 'MALE'
        ? 'L'
        : e.user.profile?.gender === 'FEMALE'
          ? 'P'
          : '',
    'Tempat Lahir': e.user.profile?.birthPlace ?? '',
    'Tanggal Lahir': e.user.profile?.birthDate
      ? new Date(e.user.profile.birthDate).toISOString().split('T')[0]
      : '',
    Email: e.user.profile?.email ?? '',
    Telepon: e.user.profile?.phone ?? '',
    Jabatan: e.teacherPositions?.[0]?.position?.name ?? '',
    Identifier: e.user.identifier,
    Status: e.user.isActive ? 'Aktif' : 'Nonaktif',
  };
}
