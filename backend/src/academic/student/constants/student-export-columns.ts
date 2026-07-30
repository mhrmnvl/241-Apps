import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

export function mapStudentToExportRow(s: StudentWithDetails) {
  const user = s.user;
  const latestEnrollment = s.enrollments?.[0];
  const profile = user.profile;

  return {
    NIS: s.nis,
    NISN: s.nisn,
    Nama: profile?.name ?? '',
    NIK: profile?.nik ?? '',
    'Jenis Kelamin':
      profile?.gender === 'MALE'
        ? 'L'
        : profile?.gender === 'FEMALE'
          ? 'P'
          : '',
    'Tempat Lahir': profile?.birthPlace ?? '',
    'Tanggal Lahir': profile?.birthDate
      ? new Date(profile.birthDate).toISOString().split('T')[0]
      : '',
    Email: profile?.email ?? '',
    Telepon: profile?.phone ?? '',
    Tingkat: s.grade ? String(s.grade.level) : '',
    Kelas: latestEnrollment ? latestEnrollment.classroom.code : '',
    Status: s.status,
    Identifier: user.identifier,
    'Akun Aktif': user.isActive ? 'Aktif' : 'Nonaktif',
  };
}
