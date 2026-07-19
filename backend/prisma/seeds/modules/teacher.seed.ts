import { PrismaClient, UserGender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const TEACHER_DEFINITIONS = [
  {
    name: 'Abdul Mugni Lutfi, S.Pd.I',
    username: 'mugni.lutfi',
    subjects: ['Ilmu Pengetahuan Sosial'],
  },
  {
    name: 'Afidah Dzuifa Husna, S.Pd',
    username: 'afidah.husna',
    subjects: ['Bahasa Inggris'],
  },
  {
    name: 'Ahmad Aripin, S.Pd.I',
    username: 'ahmad.aripin',
    subjects: ["Syari'ah"],
  },
  {
    name: 'Ahmad Rifki Mujahid, S.Pd',
    username: 'rifki.mujahid',
    subjects: ['Pendidikan Jasmani, Olahraga dan Kesehatan'],
  },
  {
    name: 'Ahyar Sudrajat, S.Pd.I',
    username: 'ahyar.sudrajat',
    subjects: ['Mustholah/Hadits'],
  },
  {
    // Fikih semua kelas; Nahwu Shorof hanya kelas 9
    name: 'Angga Abdul Latif Fauzi, S.Pd',
    username: 'angga.latif',
    subjects: ['Fikih'],
    subjectsByLevel: { 9: ['Fikih', 'Nahwu Shorof'] },
  },
  {
    name: 'Anshor Jaar Gozali, S.Pd',
    username: 'anshor.gozali',
    subjects: ['Sejarah Kebudayaan Islam'],
  },
  {
    name: 'Asep Hidayat, S.Pd.I',
    username: 'asep.hidayat',
    subjects: ["Tafsir Al-Qur'an"],
  },
  {
    // Matematika + IPA hanya kelas 7 & 8
    name: 'Asri Aenun Jariah, S.Pd',
    username: 'asri.aenun',
    subjects: [],
    subjectsByLevel: {
      7: ['Matematika', 'Ilmu Pengetahuan Alam'],
      8: ['Matematika', 'Ilmu Pengetahuan Alam'],
    },
  },
  {
    name: 'Drs. Taopik Rokhman',
    username: 'taopik.rokhman',
    subjects: ['Balaghoh'],
  },
  {
    name: 'Hamzah Fikri Dienul Haq, S.Ag',
    username: 'hamzah.fikri',
    subjects: ['Tauhid'],
  },
  {
    // Mutholaah semua kelas; Ushul Fiqih kelas 9; Nahwu Shorof kelas 7
    name: 'Ibnu Mochamad Hawwari, S. Ag',
    username: 'ibnu.hawwari',
    subjects: ["Muthola'ah"],
    subjectsByLevel: {
      7: ["Muthola'ah", 'Nahwu Shorof'],
      9: ["Muthola'ah", 'Ushul Fiqih'],
    },
  },
  {
    name: 'Ilyas Dzulkifli, S.Ag',
    username: 'ilyas.dzulkifli',
    subjects: ['Informatika'],
  },
  {
    name: 'Insan Fauzan Azhiema, S.Pd',
    username: 'insan.fauzan',
    subjects: ["Al Qur'an Hadis"],
  },
  {
    name: 'Putriana Isnaeni',
    username: 'putriana.isnaeni',
    subjects: ['Akidah Akhlak'],
  },
  {
    name: 'Raiz Izzulhaq Sutisna, S.Pd',
    username: 'raiz.sutisna',
    subjects: ['Pendidikan Pancasila'],
  },
  {
    name: 'Rosyidah Rohaeni, S.Pd.I',
    username: 'rosyidah.rohaeni',
    subjects: ['Bahasa Sunda'],
  },
  {
    name: 'Salsabila Lutfiah Khoerunnisa',
    username: 'salsabila.lutfiah',
    subjects: ['Bahasa Indonesia'],
  },
  {
    // IPA hanya kelas 9
    name: 'Tatang Gojali, S.Pd.',
    username: 'tatang.gojali',
    subjects: [],
    subjectsByLevel: { 9: ['Ilmu Pengetahuan Alam', 'Matematika'] },
  },
  {
    name: 'Wanda Nurazizah Balqis',
    username: 'wanda.balqis',
    subjects: ['Bahasa Arab'],
  },
] as const;

export async function seedTeachersOnly(
  prisma: PrismaClient,
  schoolUnitId: string,
) {
  const defaultPassword = 'password123';
  const hashed = await bcrypt.hash(defaultPassword, 10);

  const teacherRole = await prisma.role.findFirst({
    where: { code: 'TEACHER' },
  });

  const createdTeachers: { id: string; username: string }[] = [];
  let created = 0;

  for (let i = 0; i < TEACHER_DEFINITIONS.length; i++) {
    const def = TEACHER_DEFINITIONS[i];

    let user = await prisma.user.findFirst({
      where: { identifier: def.username },
    });
    user ??= await prisma.user.create({
      data: {
        identifier: def.username,
        passwordHash: hashed,
        isActive: true,
      },
    });

    if (teacherRole) {
      const roleExists = await prisma.userRole.findFirst({
        where: { userId: user.id, roleId: teacherRole.id },
      });
      if (!roleExists) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: teacherRole.id,
          },
        });
      }

      const nik = `3573010101800${String(i + 1).padStart(3, '0')}`;
      const nikExists = await prisma.profile.findFirst({ where: { nik } });
      if (!nikExists) {
        await prisma.profile.create({
          data: {
            userId: user.id,
            name: def.name,
            nik,
            gender: UserGender.MALE,
            birthPlace: 'Bandung',
            birthDate: new Date('1985-01-01'),
            email: `${def.username}@mts241alikhlash.sch.id`,
            phone: `0812345${String(i + 1).padStart(5, '0')}`,
          },
        });
      }
    }

    let teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    if (!teacher) {
      let empType = await prisma.employmentType.findFirst({
        where: { code: 'NON_ASN' },
      });
      empType ??= await prisma.employmentType.create({
        data: {
          code: 'NON_ASN',
          name: 'Non ASN',
        },
      });

      teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          nip: null,
          employmentTypeId: empType.id,
        },
      });

      const hasAddr = await prisma.address.findFirst({
        where: { teacherId: teacher.id },
      });
      if (!hasAddr) {
        await prisma.address.create({
          data: {
            teacherId: teacher.id,
            street: 'Kp. Sukamulya',
            rt: '002',
            rw: '008',
            village: 'Bojongkunci',
            district: 'Pameungpeuk',
            city: 'Kabupaten Bandung',
            province: 'Jawa Barat',
            postalCode: '40376',
            isPrimary: true,
          },
        });
      }

      created++;
    }

    createdTeachers.push({ id: teacher.id, username: def.username });
    console.log(`  [teacher] ${def.username} (${def.name})`);
  }

  console.log(
    `\n  [teacher] ${created} created, ${createdTeachers.length} total`,
  );
  return createdTeachers;
}
