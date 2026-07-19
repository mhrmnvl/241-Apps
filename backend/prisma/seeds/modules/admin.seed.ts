import { PrismaClient, UserGender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const e = (key: string, fallback: string) => {
  const val = process.env[key];
  return val && val.trim() !== '' ? val : fallback;
};

export async function seedAdmin(prisma: PrismaClient) {
  const username = e('SEED_ADMIN_USERNAME', 'admin');
  const password = e('SEED_ADMIN_PASSWORD', 'admin123');
  const name = e('SEED_ADMIN_NAME', 'Administrator');
  const nik = e('SEED_ADMIN_NIK', '0000000000000001');
  const gender = e('SEED_ADMIN_GENDER', 'MALE') as UserGender;
  const birthPlace = e('SEED_ADMIN_BIRTH_PLACE', 'Bandung');
  const birthDate = new Date(e('SEED_ADMIN_BIRTH_DATE', '1980-01-01'));
  const email = e('SEED_ADMIN_EMAIL', 'admin@siakad.sch.id');
  const phone = e('SEED_ADMIN_PHONE', '081234567890');

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { identifier: username },
    update: {
      passwordHash: hashed,
      isActive: true,
      deletedAt: null,
    },
    create: {
      identifier: username,
      passwordHash: hashed,
      isActive: true,
    },
  });

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    const conflictingProfile = await prisma.profile.findFirst({
      where: { OR: [{ nik }, { email }, { phone }] },
    });

    if (!conflictingProfile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          name,
          nik,
          gender,
          birthPlace,
          birthDate,
          email,
          phone,
        },
      });
    } else {
      console.log(
        `  [admin] profile conflict for ${username}, user created without profile`,
      );
    }
  }

  console.log(`  [admin] ${username} (${name})`);
  return user;
}
