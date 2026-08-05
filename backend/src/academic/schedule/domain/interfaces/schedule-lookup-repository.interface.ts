import {
  ActiveSemesterIdRef,
  ClassroomIdRef,
  CreateTeachingAssignmentFromScheduleInput,
  TeachingAssignmentIdRef,
} from './schedule-repository.interface.js';

/**
 * Reads and writes the scheduling flow needs *outside* the Schedule aggregate.
 *
 * Split out of `IScheduleRepository` so that contract stays about schedules
 * only: placing a lesson may have to resolve a classroom, find the active
 * semester, or create the teaching assignment the row will hang off. Only
 * `CreateScheduleUseCase` and `BatchUpsertScheduleUseCase` depend on this.
 */
export abstract class IScheduleLookupRepository {
  abstract findTeachingAssignmentById(
    id: string,
  ): Promise<TeachingAssignmentIdRef | null>;
  abstract findValidClassroomById(id: string): Promise<ClassroomIdRef | null>;
  abstract findActiveSemester(): Promise<ActiveSemesterIdRef | null>;
  abstract findTeachingAssignmentBySubjectAndSemester(
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<TeachingAssignmentIdRef | null>;
  abstract findAnyTeacherIdForSubject(
    subjectId: string,
  ): Promise<string | null>;
  abstract createTeachingAssignment(
    input: CreateTeachingAssignmentFromScheduleInput,
  ): Promise<TeachingAssignmentIdRef>;
}
