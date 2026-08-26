import { ConflictException } from '@nestjs/common';
import { DayEnum } from '../../../shared/domain/enums/day.enum.js';
import type {
  IScheduleRepository,
  ScheduleWithDetails,
} from '../domain/interfaces/schedule-repository.interface.js';
import { assertSlotIsFree, PlannedLesson } from './assert-slot-is-free.js';

/**
 * The two collisions the database cannot catch.
 *
 * Its unique index is `(teachingAssignment, day, timeSlot)`, which refuses the
 * same subject twice in one period and permits both of the ones below. These
 * tests exist because the queries that find them sat in the repository unused:
 * a check nothing calls passes every review by being present.
 */
describe('assertSlotIsFree', () => {
  const lesson: PlannedLesson = {
    teacherId: 'teacher-1',
    classroomId: 'class-1',
    semesterId: 'semester-1',
    timeSlotId: 'slot-3',
    day: DayEnum.MONDAY,
  };

  const clash = (over: {
    subject: string;
    classroom: string;
    teacher?: string;
  }) =>
    ({
      id: 'schedule-9',
      day: 'MONDAY',
      timeSlot: { name: 'Jam Ke-1' },
      teachingAssignment: {
        subject: { name: over.subject },
        classroom: { code: over.classroom },
        teacher: { user: { profile: { name: over.teacher ?? 'Pak Ahmad' } } },
      },
    }) as unknown as ScheduleWithDetails;

  const repo = {
    findClassroomConflictingSchedule: jest.fn(),
    findTeacherConflictingSchedule: jest.fn(),
  };
  const schedules = repo as unknown as IScheduleRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findClassroomConflictingSchedule.mockResolvedValue(null);
    repo.findTeacherConflictingSchedule.mockResolvedValue(null);
  });

  it('allows a period nobody is using', async () => {
    await expect(assertSlotIsFree(schedules, lesson)).resolves.toBeUndefined();
  });

  it('refuses a class already in another lesson, and names it', async () => {
    repo.findClassroomConflictingSchedule.mockResolvedValue(
      clash({ subject: 'Matematika', classroom: 'VII-A' }),
    );

    await expect(assertSlotIsFree(schedules, lesson)).rejects.toThrow(
      ConflictException,
    );
    await expect(assertSlotIsFree(schedules, lesson)).rejects.toThrow(
      /Matematika \(VII-A\) hari Senin Jam Ke-1/,
    );
  });

  it('refuses a teacher already in another classroom, and names them', async () => {
    repo.findTeacherConflictingSchedule.mockResolvedValue(
      clash({ subject: 'Fikih', classroom: 'IX-B', teacher: 'Bu Siti' }),
    );

    await expect(assertSlotIsFree(schedules, lesson)).rejects.toThrow(
      /Bu Siti sudah mengajar/,
    );
  });

  it('reports the class before the teacher when both collide', async () => {
    repo.findClassroomConflictingSchedule.mockResolvedValue(
      clash({ subject: 'Matematika', classroom: 'VII-A' }),
    );
    repo.findTeacherConflictingSchedule.mockResolvedValue(
      clash({ subject: 'Fikih', classroom: 'IX-B' }),
    );

    await expect(assertSlotIsFree(schedules, lesson)).rejects.toThrow(
      /Kelas ini sudah ada pelajaran/,
    );
  });

  it('excludes the row being edited, so moving a lesson does not clash with itself', async () => {
    await assertSlotIsFree(schedules, lesson, 'schedule-1');

    for (const call of [
      repo.findClassroomConflictingSchedule,
      repo.findTeacherConflictingSchedule,
    ]) {
      expect(call).toHaveBeenCalledWith(
        expect.any(String),
        'semester-1',
        'slot-3',
        DayEnum.MONDAY,
        'schedule-1',
      );
    }
  });

  it('still refuses when the clashing row carries no names to print', async () => {
    repo.findClassroomConflictingSchedule.mockResolvedValue({
      id: 'schedule-9',
      day: 'MONDAY',
    });

    await expect(assertSlotIsFree(schedules, lesson)).rejects.toThrow(
      ConflictException,
    );
  });
});
