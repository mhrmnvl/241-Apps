import { Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentIdentityReadPort } from '../domain/interfaces/student-identity-read.port.js';
import {
  ClassroomWithDetails,
  IClassroomRepository,
} from '../../classroom/domain/interfaces/classroom-repository.interface.js';
import {
  IClassroomStructureRepository,
  StructureWithDetails,
} from '../../classroom/domain/interfaces/classroom-structure-repository.interface.js';
import {
  IClassroomSupervisorRepository,
  SupervisorWithDetails,
} from '../../classroom/domain/interfaces/classroom-supervisor-repository.interface.js';
import {
  ITeachingAssignmentRepository,
  TeachingAssignmentWithDetails,
} from '../../teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.js';
import { EnrollmentWithDetails } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import {
  CLASSMATE_LIMIT,
  SUBJECT_LIMIT,
} from '../constants/my-classroom.constants.js';

export interface MyClassroom {
  classroom: ClassroomWithDetails;
  /** Ketua, wakil, sekretaris, bendahara — null before the class elects them. */
  structure: StructureWithDetails | null;
  /** The homeroom teacher, null before one is assigned. */
  supervisor: SupervisorWithDetails | null;
  /** Everyone enrolled in it this term, the caller included. */
  classmates: EnrollmentWithDetails[];
  /**
   * What the class is taught this term, and by whom.
   *
   * Part of the classroom rather than a read of its own: "which subjects do I
   * study" is the same question as "whose class am I in", and answering it
   * separately would mean a student needs `teaching-assignments.read` — the
   * register of every assignment the school has made.
   */
  subjects: TeachingAssignmentWithDetails[];
}

/**
 * The classroom the caller sits in, answered from their own enrolment.
 *
 * Lives under `student/` rather than `classroom/` because the question is
 * about the student: which room does *this person* sit in. It also keeps the
 * module graph as it is — `StudentModule` already reaches the classroom
 * repositories and the enrolments, where `ClassroomModule` would have needed a
 * `forwardRef` back to both to ask the same thing.
 *
 * There is deliberately no id to pass. A student may see one classroom — the
 * one they are in — and the moment the route takes an id, the answer depends
 * on what was asked for rather than on who is asking. `classrooms.read` is the
 * register of every class the school runs; this is not a narrowed version of
 * it, it is a different question.
 *
 * What it returns is what a student came to find out: who runs the class, who
 * teaches it, and who else is in it. Not the management screen's data — no
 * list of transferable students, no teacher directory.
 *
 * Null all the way down where the caller has no student record or no enrolment
 * this term, which is a real state at the start of a year. The caller returns
 * that plainly rather than falling back to an unscoped read.
 */
@Injectable()
export class GetMyClassroomUseCase {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly structureRepository: IClassroomStructureRepository,
    private readonly supervisorRepository: IClassroomSupervisorRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(userId: string): Promise<MyClassroom | null> {
    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);
    if (!studentId) return null;

    const enrollment =
      await this.enrollmentRepository.findActiveEnrollment(studentId);
    if (!enrollment?.classroomId) return null;

    const classroom = await this.classroomRepository.findById(
      enrollment.classroomId,
    );
    if (!classroom) return null;

    const scope = {
      classroomId: enrollment.classroomId,
      semesterId: enrollment.semesterId,
    };

    const [structures, supervisors, classmates, subjects] = await Promise.all([
      this.structureRepository.findAll({ ...scope, page: 1, limit: 1 }),
      this.supervisorRepository.findAll({ ...scope, page: 1, limit: 1 }),
      this.enrollmentRepository.findAll({
        ...scope,
        page: 1,
        limit: CLASSMATE_LIMIT,
      }),
      this.teachingAssignmentRepository.findAll({
        ...scope,
        page: 1,
        limit: SUBJECT_LIMIT,
      }),
    ]);

    return {
      classroom,
      structure: structures.data[0] ?? null,
      supervisor: supervisors.data[0] ?? null,
      classmates: classmates.data,
      subjects: subjects.data,
    };
  }
}
