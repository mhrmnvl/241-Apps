import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedSocialMedias(prisma: PrismaClient) {
  const names = e(
    'SEED_PLATFORMS',
    'Instagram,Facebook,Twitter,YouTube,TikTok,WhatsApp,Telegram,LinkedIn',
  )
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  let created = 0;
  for (const name of names) {
    const exists = await prisma.socialMedia.findFirst({ where: { name } });
    if (!exists) {
      await prisma.socialMedia.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [socialMedia] ${created} created, ${names.length} total configured`,
  );
}
