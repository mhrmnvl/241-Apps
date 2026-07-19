import { Day, PrismaClient } from '@prisma/client';
import { TEACHER_DEFINITIONS } from './teacher.seed.js';

/**
 * Konfigurasi 6 kelas target beserta level masing-masing
 */
const TARGET_CLASSROOMS = [
  { code: 'VII-A', level: 7 },
  { code: 'VII-B', level: 7 },
  { code: 'VIII-A', level: 8 },
  { code: 'VIII-B', level: 8 },
  { code: 'IX-A', level: 9 },
  { code: 'IX-B', level: 9 },
];

/**
 * Distribusi hari per kelas — di-offset agar guru yang sama
 * tidak bentrok mengajar 2 kelas di hari yang sama.
 */
const CLASS_DAY_OFFSET: Record<string, number> = {
  'VII-A': 0,
  'VII-B': 1,
  'VIII-A': 2,
  'VIII-B': 3,
  'IX-A': 4,
  'IX-B': 5,
};

const ALL_DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
];

/** Kembalikan mapel yang diampu guru ini untuk level kelas tertentu */
function getSubjectsForLevel(
  def: (typeof TEACHER_DEFINITIONS)[number],
  level: number,
): readonly string[] {
  const byLevel = (def as { subjectsByLevel?: Record<number, string[]> })
    .subjectsByLevel;
  if (byLevel?.[level]) {
    return byLevel[level];
  }
  return def.subjects;
}

export async function seedFullSchedule(prisma: PrismaClient) {
  // ── Ambil semester aktif ──────────────────────────────────────────────────
  const semester = await prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
    include: { type: true },
  });
  if (!semester) {
    console.log('  [schedule-full] ⚠ Tidak ada semester aktif, skip.');
    return;
  }
  console.log(
    `  [schedule-full] Semester aktif: ${semester.type?.name} (${semester.id})`,
  );

  // ── Ambil time slots LESSON saja ─────────────────────────────────────────
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      type: { code: 'LESSON' },
      deletedAt: null,
    },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, order: true },
  });
  if (timeSlots.length === 0) {
    console.log('  [schedule-full] ⚠ Tidak ada LESSON time slot, skip.');
    return;
  }
  console.log(`  [schedule-full] ${timeSlots.length} LESSON slots tersedia.`);

  // ── Ambil semua subject dari DB ───────────────────────────────────────────
  const allSubjects = await prisma.subject.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  const subjectMap = new Map(allSubjects.map((s) => [s.name, s.id]));

  // ── Ambil semua teacher berdasarkan username ─────────────────────────────
  const teacherMap = new Map<string, string>(); // username → teacherId
  for (const def of TEACHER_DEFINITIONS) {
    const user = await prisma.user.findFirst({
      where: { identifier: def.username, deletedAt: null },
    });
    if (!user) continue;
    const emp = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    if (!emp) continue;
    teacherMap.set(def.username, emp.id);
  }
  console.log(`  [schedule-full] ${teacherMap.size} guru ditemukan.`);

  // ── Proses tiap kelas ─────────────────────────────────────────────────────
  let taCreated = 0;
  let schedCreated = 0;
  let schedSkipped = 0;

  for (const cls of TARGET_CLASSROOMS) {
    const classroom = await prisma.classroom.findFirst({
      where: { code: cls.code, deletedAt: null },
    });
    if (!classroom) {
      console.log(
        `  [schedule-full] ⚠ Kelas ${cls.code} tidak ditemukan, skip.`,
      );
      continue;
    }

    const dayOffset = CLASS_DAY_OFFSET[cls.code] ?? 0;

    /**
     * Kumpulkan semua pasangan (guru, mapel) untuk kelas ini.
     * Setiap pasangan akan mendapat 2 slot/minggu di hari berbeda.
     */
    const assignments: {
      teacherId: string;
      subjectId: string;
      subjectName: string;
    }[] = [];

    for (const def of TEACHER_DEFINITIONS) {
      const empId = teacherMap.get(def.username);
      if (!empId) continue;

      const subjectNames = getSubjectsForLevel(def, cls.level);
      for (const sName of subjectNames) {
        const subjectId = subjectMap.get(sName);
        if (!subjectId) {
          console.log(
            `  [schedule-full] ⚠ Mapel "${sName}" tidak ditemukan di DB.`,
          );
          continue;
        }
        assignments.push({ teacherId: empId, subjectId, subjectName: sName });
      }
    }

    console.log(
      `\n  ── Kelas ${cls.code} (level ${cls.level}): ${assignments.length} mapel ──`,
    );

    /**
     * Distribusi jadwal — 2 jam/minggu per mapel.
     * Kita rotasi hari dari offset kelas, dan slot dari urutan order.
     * Tracker conflict: { day → Set<timeSlotId> } per kelas
     * Tracker guru-conflict: Map<teacherId → Map<day → Set<timeSlotId>>>
     */

    // Global conflict tracker untuk guru (antar kelas)
    // Di-pass by reference, dibuat sekali luar loop kelas
    for (let jamKe = 0; jamKe < 2; jamKe++) {
      // 2 jam per minggu = 2 kali assign
      for (let aIdx = 0; aIdx < assignments.length; aIdx++) {
        const { teacherId, subjectId, subjectName } = assignments[aIdx];

        // Pastikan TeachingAssignment ada
        let ta = await prisma.teachingAssignment.findFirst({
          where: {
            teacherId,
            classroomId: classroom.id,
            subjectId,
            semesterId: semester.id,
            deletedAt: null,
          },
        });
        if (!ta) {
          ta = await prisma.teachingAssignment.create({
            data: {
              teacherId,
              classroomId: classroom.id,
              subjectId,
              semesterId: semester.id,
            },
          });
          taCreated++;
        }

        // Cari slot hari + jam yang tidak bentrok
        // Strategi: rotasi hari dari offset, rotasi slot dari aIdx + jamKe
        let scheduled = false;

        for (let dayTry = 0; dayTry < ALL_DAYS.length && !scheduled; dayTry++) {
          const dayIdx =
            (dayOffset +
              aIdx +
              jamKe * Math.ceil(ALL_DAYS.length / 2) +
              dayTry) %
            ALL_DAYS.length;
          const day = ALL_DAYS[dayIdx];

          for (
            let slotTry = 0;
            slotTry < timeSlots.length && !scheduled;
            slotTry++
          ) {
            const slotIdx = (aIdx + jamKe + slotTry) % timeSlots.length;
            const slot = timeSlots[slotIdx];

            // Cek conflict di kelas ini (hari + slot sudah dipakai mapel lain)
            const classConflict = await prisma.schedule.findFirst({
              where: {
                timeSlotId: slot.id,
                day,
                teachingAssignment: { classroomId: classroom.id },
                deletedAt: null,
              },
            });
            if (classConflict) continue;

            // Cek conflict guru (guru sudah mengajar di kelas lain pada hari + slot yang sama)
            const teacherConflict = await prisma.schedule.findFirst({
              where: {
                timeSlotId: slot.id,
                day,
                teachingAssignment: { teacherId },
                deletedAt: null,
              },
            });
            if (teacherConflict) continue;

            // Cek apakah schedule sudah ada (soft-deleted restore atau duplikat)
            const existingSchedule = await prisma.schedule.findFirst({
              where: {
                teachingAssignmentId: ta.id,
                day,
                timeSlotId: slot.id,
                deletedAt: null,
              },
            });
            if (existingSchedule) {
              schedSkipped++;
              scheduled = true;
              continue;
            }

            await prisma.schedule.create({
              data: {
                teachingAssignmentId: ta.id,
                timeSlotId: slot.id,
                day,
              },
            });
            schedCreated++;
            scheduled = true;
            console.log(
              `    ✓ ${cls.code} | ${day.padEnd(10)} | ${slot.name.padEnd(10)} | ${subjectName}`,
            );
          }
        }

        if (!scheduled) {
          console.log(
            `    ⚠ Tidak bisa assign: ${cls.code} | ${subjectName} (jam ke-${jamKe + 1}) — semua slot bentrok`,
          );
        }
      }
    }
  }

  console.log(`\n  [schedule-full] TeachingAssignment: ${taCreated} created`);
  console.log(
    `  [schedule-full] Schedule: ${schedCreated} created, ${schedSkipped} skipped`,
  );
}
