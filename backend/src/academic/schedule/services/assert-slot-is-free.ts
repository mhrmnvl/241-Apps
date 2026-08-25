import { ConflictException } from '@nestjs/common';
import { DayEnum } from '../../../shared/domain/enums/day.enum.js';
import {
  IScheduleRepository,
  ScheduleWithDetails,
} from '../domain/interfaces/schedule-repository.interface.js';

/** Where a lesson is about to be put, and whose it is. */
export interface PlannedLesson {
  teacherId: string;
  classroomId: string;
  semesterId: string;
  timeSlotId: string;
  day: DayEnum;
}

const DAY_NAMES: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};

/**
 * The clashing lesson, in words a person can act on.
 *
 * Every relation is reached optionally: the domain's `ScheduleWithDetails`
 * declares them so, and a message is not worth throwing a second error over.
 * A refusal that names nothing is still a refusal; one that names the wrong
 * thing is worse than one that names less.
 */
function describe(row: ScheduleWithDetails): string {
  const subject = row.teachingAssignment?.subject?.name ?? 'pelajaran lain';
  const classroom = row.teachingAssignment?.classroom?.code;
  const day = DAY_NAMES[row.day] ?? row.day;
  const slot = row.timeSlot?.name ?? 'jam tersebut';
  return `${subject}${classroom ? ` (${classroom})` : ''} hari ${day} ${slot}`;
}

/**
 * Refuse a lesson that would put a class or a teacher in two places at once.
 *
 * A timetable has exactly two collisions worth the name, and the schema
 * catches neither. Its unique index is `(teachingAssignment, day, timeSlot)` —
 * it stops *the same subject* being placed twice in one period, which is the
 * one mistake nobody makes. What it allows is the two that matter:
 *
 *   - two different subjects in the same class in the same period, so the
 *     children would have to be in two lessons at once;
 *   - one teacher in two classrooms in the same period.
 *
 * The queries to find both have been in the repository from the start, fully
 * written and never called: `CreateScheduleUseCase` checked only for the
 * duplicate the database was already refusing, and `UpdateScheduleUseCase` did
 * the same. A timetable built through the screens could not be run by a
 * school, and nothing said so.
 *
 * `excludeScheduleId` is the row being edited — without it, moving a lesson's
 * room would find the lesson itself and call it a clash.
 */
export async function assertSlotIsFree(
  schedules: IScheduleRepository,
  lesson: PlannedLesson,
  excludeScheduleId?: string,
): Promise<void> {
  const [classroomClash, teacherClash] = await Promise.all([
    schedules.findClassroomConflictingSchedule(
      lesson.classroomId,
      lesson.semesterId,
      lesson.timeSlotId,
      lesson.day,
      excludeScheduleId,
    ),
    schedules.findTeacherConflictingSchedule(
      lesson.teacherId,
      lesson.semesterId,
      lesson.timeSlotId,
      lesson.day,
      excludeScheduleId,
    ),
  ]);

  // The class first: it is the more concrete of the two on screen, and a
  // person looking at one classroom's timetable can see what it collides with.
  if (classroomClash) {
    throw new ConflictException(
      `Kelas ini sudah ada pelajaran pada jam tersebut: ${describe(classroomClash)}.`,
    );
  }

  if (teacherClash) {
    const teacher =
      teacherClash.teachingAssignment?.teacher?.user?.profile?.name ??
      'Guru ini';
    throw new ConflictException(
      `${teacher} sudah mengajar pada jam tersebut: ${describe(teacherClash)}.`,
    );
  }
}
