import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  BulkStudentScoreRecord,
  StudentScoreRosterItem,
} from '../../domain/interfaces/student-score-repository.interface.js';

/**
 * The grading screen works on a *roster*: every student enrolled in the
 * assessment item's classroom, whether or not a score exists yet. Building it
 * from enrolments (rather than from scores) is what makes the blank rows show
 * up for students who have not been marked.
 */
export async function buildScoreRoster(
  prisma: PrismaService,
  assessmentItemId: string,
  classroomId?: string,
  semesterId?: string,
): Promise<StudentScoreRosterItem[]> {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      ...(classroomId && { classroomId }),
      ...(semesterId && { semesterId }),
      deletedAt: null,
    },
    select: {
      id: true,
      student: {
        select: {
          nis: true,
          user: { select: { profile: { select: { name: true } } } },
        },
      },
    },
  });

  const scores = await prisma.studentScore.findMany({
    where: {
      assessmentItemId,
      deletedAt: null,
      enrollmentId: { in: enrollments.map((e) => e.id) },
    },
  });
  const scoreMap = new Map(scores.map((s) => [s.enrollmentId, s]));

  return enrollments
    .map((e) => {
      const s = scoreMap.get(e.id);
      return {
        enrollmentId: e.id,
        nis: e.student.nis,
        studentName: e.student.user.profile?.name ?? '-',
        scoreId: s?.id ?? null,
        score: s?.score ?? null,
        note: s?.note ?? null,
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

/**
 * Saves a whole roster in one transaction. Upsert keyed on the
 * (enrollment, assessmentItem) unique pair, and clearing `deletedAt` so a
 * previously removed score is revived rather than duplicated.
 */
export async function upsertScores(
  prisma: PrismaService,
  assessmentItemId: string,
  records: BulkStudentScoreRecord[],
): Promise<{ saved: number }> {
  const results = await prisma.$transaction(
    records.map((record) =>
      prisma.studentScore.upsert({
        where: {
          enrollmentId_assessmentItemId: {
            enrollmentId: record.enrollmentId,
            assessmentItemId,
          },
        },
        update: {
          score: record.score,
          note: record.note,
          deletedAt: null,
        },
        create: {
          enrollmentId: record.enrollmentId,
          assessmentItemId,
          score: record.score,
          note: record.note,
        },
      }),
    ),
  );
  return { saved: results.length };
}
