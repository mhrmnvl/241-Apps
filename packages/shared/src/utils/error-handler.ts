type ErrorMapping = [test: (msg: string) => boolean, translation: string]

const ERROR_MAPPINGS: ErrorMapping[] = [
  [
    (m) => m.includes('invalid credentials'),
    'Email atau kata sandi yang Anda masukkan salah.',
  ],
  [
    (m) => m.includes('invalid or expired token'),
    'Sesi Anda sudah tidak valid. Silakan login kembali.',
  ],
  [
    (m) => m.includes('invalid token type'),
    'Token tidak valid. Silakan login kembali.',
  ],
  [
    (m) => m.includes('refresh token not found'),
    'Sesi tidak ditemukan. Silakan login kembali.',
  ],
  [
    (m) => m.includes('token reuse detected'),
    'Aktivitas mencurigakan terdeteksi. Sesi Anda telah dicabut, silakan login kembali.',
  ],
  [
    (m) => m.includes('user account is deactivated'),
    'Akun Anda telah dinonaktifkan. Hubungi administrator.',
  ],
  [
    (m) => m.includes('session expired or revoked'),
    'Sesi Anda telah kedaluwarsa atau dicabut. Silakan login kembali.',
  ],
  [
    (m) => m.includes('identifier already taken'),
    'Username tersebut sudah digunakan.',
  ],
  [(m) => m.includes('user not found'), 'Data pengguna tidak ditemukan.'],

  [
    (m) => m.includes('academic year') && m.includes('already exists'),
    'Tahun ajaran dengan nama tersebut sudah terdaftar.',
  ],
  [
    (m) => m.includes('academic year') && m.includes('not found'),
    'Data tahun ajaran tidak ditemukan.',
  ],

  [
    (m) => m.includes('semester') && m.includes('already exists'),
    'Semester tersebut sudah terdaftar pada tahun ajaran yang dipilih.',
  ],
  [
    (m) => m.includes('semester') && m.includes('not found'),
    'Data semester tidak ditemukan.',
  ],

  [
    (m) =>
      (m.includes('curriculum') || m.includes('curricula')) &&
      m.includes('already exists'),
    'Kurikulum dengan nama tersebut sudah terdaftar pada tahun ajaran yang dipilih.',
  ],
  [
    (m) =>
      (m.includes('curriculum') || m.includes('curricula')) &&
      m.includes('not found'),
    'Data kurikulum tidak ditemukan.',
  ],

  [
    (m) => m.includes('class') && m.includes('already exists in this grade'),
    'Kelas dengan nama tersebut sudah terdaftar pada tingkat yang dipilih.',
  ],
  [
    (m) => m.includes('is not a teacher'),
    'Wali kelas tidak ditemukan atau pengguna tersebut bukan guru.',
  ],
  [
    (m) => m.includes('class') && m.includes('not found'),
    'Data kelas tidak ditemukan.',
  ],

  [
    (m) => m.includes('already has a supervisor'),
    'Kelas ini sudah memiliki wali kelas untuk semester yang dipilih.',
  ],
  [
    (m) => m.includes('classsupervisor') && m.includes('not found'),
    'Data wali kelas tidak ditemukan.',
  ],

  [
    (m) => m.includes('already enrolled in a class for this semester'),
    'Siswa sudah terdaftar di kelas lain untuk semester ini.',
  ],
  [
    (m) => m.includes('already enrolled in this semester'),
    'Siswa sudah terdaftar di semester ini.',
  ],
  [
    (m) => m.includes('classenrollment') && m.includes('not found'),
    'Data pendaftaran kelas tidak ditemukan.',
  ],
  [
    (m) => m.includes('studentenrollment') && m.includes('not found'),
    'Data pendaftaran kelas tidak ditemukan.',
  ],

  [
    (m) =>
      m.includes('subject') && m.includes('teacher') && m.includes('already'),
    'Guru tersebut sudah ditugaskan pada mata pelajaran ini.',
  ],
  [
    (m) => m.includes('subject') && m.includes('already exists'),
    'Mata pelajaran dengan nama tersebut sudah terdaftar.',
  ],
  [
    (m) => m.includes('subject') && m.includes('not found'),
    'Data mata pelajaran tidak ditemukan.',
  ],

  [
    (m) => m.includes('triplet') && m.includes('already'),
    'Kombinasi guru, mata pelajaran, dan kelas ini sudah terdaftar.',
  ],
  [
    (m) => m.includes('subjectteacher') && m.includes('not found'),
    'Data penugasan guru mapel tidak ditemukan.',
  ],

  [
    (m) =>
      m.includes('time slot') &&
      m.includes('order') &&
      m.includes('already exists'),
    'Urutan jam pelajaran tersebut sudah ada.',
  ],
  [
    (m) => m.includes('timeslot') && m.includes('still used'),
    'Jam pelajaran tidak bisa dihapus karena masih digunakan pada jadwal pelajaran.',
  ],
  [
    (m) => m.includes('time slot') && m.includes('cannot be assigned a lesson'),
    'Jam pelajaran ini bertipe istirahat/upacara dan tidak bisa diisi mata pelajaran.',
  ],
  [
    (m) => m.includes('timeslot') && m.includes('not found'),
    'Data jam pelajaran tidak ditemukan.',
  ],

  [
    (m) => m.includes('lesson') && m.includes('not found'),
    'Data jadwal pelajaran tidak ditemukan.',
  ],

  [
    (m) => m.includes('academic calendar') && m.includes('not found'),
    'Data kegiatan kalender tidak ditemukan.',
  ],
  [
    (m) => m.includes('end date must be'),
    'Tanggal selesai harus sama dengan atau setelah tanggal mulai.',
  ],
  [
    (m) =>
      m.includes('menumpuk') ||
      m.includes('sudah memiliki kegiatan') ||
      m.includes('bertepatan dengan hari libur') ||
      m.includes('menetapkan hari libur'),
    '__PASSTHROUGH__',
  ], // Pesan sudah dalam bahasa Indonesia dari backend

  [
    (m) => m.includes('announcement') && m.includes('not found'),
    'Data pengumuman tidak ditemukan.',
  ],

  [
    (m) => m.includes('event') && m.includes('not found'),
    'Data acara tidak ditemukan.',
  ],

  [
    (m) =>
      (m.includes('school unit') || m.includes('institution')) &&
      m.includes('has not been set up'),
    'Data kelembagaan belum diatur. Silakan lengkapi pengaturan terlebih dahulu.',
  ],
  [
    (m) =>
      (m.includes('school unit address') ||
        m.includes('institution address')) &&
      m.includes('has not been set'),
    'Alamat lembaga belum diatur.',
  ],

  [
    (m) => m.includes('is already registered'),
    'Data tersebut (NIK/Email/No. HP) sudah terdaftar pada pengguna lain.',
  ],
  [
    (m) => m.includes('is already linked to the profile'),
    'Platform sosial media tersebut sudah ditambahkan pada profil ini.',
  ],
  [
    (m) => m.includes('attach an address to'),
    'Tidak dapat menambahkan alamat karena pengguna tidak memiliki relasi sebagai siswa atau pegawai.',
  ],
  [
    (m) => m.includes('social media') && m.includes('not found'),
    'Data sosial media tidak ditemukan.',
  ],
  [
    (m) => m.includes('profile') && m.includes('not found'),
    'Data profil tidak ditemukan.',
  ],

  [
    (m) => m.includes('nip') && m.includes('already'),
    'NIP tersebut sudah terdaftar pada pegawai lain.',
  ],
  [
    (m) => m.includes('nuptk') && m.includes('already'),
    'NUPTK tersebut sudah terdaftar pada pegawai lain.',
  ],
  [
    (m) => m.includes('teacher') && m.includes('not found'),
    'Data pegawai tidak ditemukan.',
  ],

  [
    (m) => m.includes('position') && m.includes('already assigned'),
    'Jabatan ini sudah ditambahkan pada pegawai tersebut di tanggal yang sama.',
  ],
  [
    (m) => m.includes('position') && m.includes('no longer active'),
    'Jabatan tersebut sudah tidak aktif dan tidak bisa ditambahkan.',
  ],
  [
    (m) => m.includes('position') && m.includes('still in use'),
    'Jabatan tidak bisa dihapus karena masih digunakan oleh pegawai.',
  ],
  [
    (m) => m.includes('position') && m.includes('already taken'),
    'Nama jabatan tersebut sudah terdaftar.',
  ],
  [
    (m) => m.includes('position') && m.includes('not found'),
    'Jabatan tidak ditemukan.',
  ],
  [
    (m) => m.includes('assignment') && m.includes('not found'),
    'Data penugasan jabatan tidak ditemukan.',
  ],

  [
    (m) => m.includes('occupation') && m.includes('already taken'),
    'Nama pekerjaan tersebut sudah terdaftar.',
  ],
  [
    (m) =>
      (m.includes('occupation') && m.includes('still in use')) ||
      (m.includes('occupation') && m.includes('cannot be deleted')),
    'Pekerjaan tidak bisa dihapus karena masih digunakan oleh data orang tua/wali.',
  ],
  [
    (m) =>
      m.includes('occupation') &&
      m.includes('inactive') &&
      m.includes('cannot be assigned'),
    'Pekerjaan tersebut sudah tidak aktif dan tidak bisa digunakan.',
  ],
  [
    (m) => m.includes('occupation') && m.includes('not found'),
    'Data pekerjaan tidak ditemukan.',
  ],

  [
    (m) => m.includes('platform') && m.includes('already exists'),
    'Platform dengan nama tersebut sudah terdaftar.',
  ],
  [
    (m) =>
      m.includes('cannot delete platform') ||
      (m.includes('platform') && m.includes('still in use')),
    'Platform tidak bisa dihapus karena masih digunakan oleh institusi atau profil.',
  ],
  [
    (m) => m.includes('platform') && m.includes('already linked'),
    'Platform ini sudah ditambahkan pada institusi ini.',
  ],
  [
    (m) => m.includes('platform') && m.includes('not found'),
    'Data platform tidak ditemukan.',
  ],

  [
    (m) => m.includes('nis') && !m.includes('nisn') && m.includes('already'),
    'NIS tersebut sudah terdaftar pada siswa lain.',
  ],
  [
    (m) => m.includes('nisn') && m.includes('already'),
    'NISN tersebut sudah terdaftar pada siswa lain.',
  ],
  [
    (m) => m.includes('already linked to the student'),
    'Orang tua/wali ini sudah terhubung dengan siswa.',
  ],
  [
    (m) => m.includes('student') && m.includes('not found'),
    'Data siswa tidak ditemukan.',
  ],

  [
    (m) =>
      m.includes('grade entry already exists') ||
      (m.includes('student') &&
        m.includes('class') &&
        m.includes('subject') &&
        m.includes('combination')),
    'Data nilai untuk kombinasi siswa, kelas, dan mata pelajaran ini sudah ada.',
  ],
  [
    (m) => m.includes('studentgrade') && m.includes('not found'),
    'Data nilai siswa tidak ditemukan.',
  ],

  [
    (m) => m.includes('parent') && m.includes('not found'),
    'Data orang tua/wali tidak ditemukan.',
  ],

  [
    (m) => m.includes('educational') && m.includes('not found'),
    'Data riwayat pendidikan tidak ditemukan.',
  ],
  [
    (m) => m.includes('education') && m.includes('not found'),
    'Data pendidikan tidak ditemukan.',
  ],

  [
    (m) => m.includes('achievement') && m.includes('not found'),
    'Data prestasi tidak ditemukan.',
  ],

  [
    (m) => m.includes('scholarship') && m.includes('not found'),
    'Data beasiswa tidak ditemukan.',
  ],

  [
    (m) => m.includes('rapor') && m.includes('not found'),
    'Data rapor tidak ditemukan.',
  ],

  [
    (m) => m.includes('nik') && m.includes('already'),
    'NIK tersebut sudah terdaftar pada pengguna lain.',
  ],

  [
    (m) => m.includes('unauthorized'),
    'Anda tidak memiliki akses untuk melakukan aksi ini. Silakan login kembali.',
  ],
  [
    (m) => m.includes('forbidden'),
    'Aksi ini tidak diizinkan untuk peran Anda.',
  ],
  [
    (m) => m.includes('already exists') || m.includes('already taken'),
    'Data tersebut sudah terdaftar atau digunakan.',
  ],
  [
    (m) => m.includes('still in use') || m.includes('cannot be deleted'),
    'Data tidak bisa dihapus karena masih digunakan oleh data lain.',
  ],
  [
    (m) => m.includes('not found') || m.includes('does not exist'),
    'Data tidak ditemukan di sistem.',
  ],
  [
    (m) => m.includes('too many requests'),
    'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
  ],
  [
    (m) => m.includes('internal server error'),
    'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  ],
]

export function getIndonesianErrorMessage(
  err: unknown,
  fallback: string,
): string {
  if (!err) return fallback

  const axiosErr = err as {
    response?: { data?: { message?: string | string[] } }
    message?: string
    code?: string
  }
  const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? ''

  if (Array.isArray(msg)) {
    return fallback
  }

  if (typeof msg === 'string') {
    const lowerMsg = msg.toLowerCase()

    for (const [test, translation] of ERROR_MAPPINGS) {
      if (test(lowerMsg)) {
        return translation === '__PASSTHROUGH__' ? msg : translation
      }
    }
  }

  if (
    axiosErr?.code === 'ERR_NETWORK' ||
    axiosErr?.message === 'Network Error'
  ) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  }

  const status = (axiosErr?.response as { status?: number } | undefined)?.status
  if (status) {
    const statusMessages: Record<number, string> = {
      400: 'Permintaan tidak valid. Periksa kembali data yang Anda kirim.',
      401: 'Sesi Anda telah berakhir. Silakan login kembali.',
      403: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
      404: 'Data yang diminta tidak ditemukan.',
      408: 'Permintaan melebihi batas waktu. Silakan coba lagi.',
      409: 'Data tersebut sudah ada atau konflik dengan data lain.',
      413: 'Ukuran file terlalu besar.',
      422: 'Data yang dikirim tidak dapat diproses. Periksa kembali isian Anda.',
      429: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
      500: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      502: 'Server sedang mengalami gangguan. Silakan coba lagi nanti.',
      503: 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.',
    }
    if (statusMessages[status]) return statusMessages[status]
  }

  return fallback
}
