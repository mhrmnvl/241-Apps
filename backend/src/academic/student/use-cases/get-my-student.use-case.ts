import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

/**
 * The caller's own student record.
 *
 * `students.read-own` was added with the rest of the self-service codes and
 * granted to the student role, and then nothing consumed it: the only single
 * student read is `GET /students/:id`, which requires `students.read`. So a
 * student was refused at the guard before the narrowing inside
 * `GetStudentByIdUseCase` could ever run, and a permission that reads like
 * access granted none — verified against the dev box, where `/students/me`
 * answered 403.
 *
 * A separate route rather than widening `:id` to accept either code. The
 * decorator requires *all* the permissions it names, so "either" cannot be
 * expressed there; and the convention it would break is the one that makes a
 * role's grants legible — `report-cards.read` answers about every student,
 * `report-cards.read-own` answers about the caller, through a route of its own.
 *
 * There is no id parameter and there cannot be one. The subject is whoever
 * signed in.
 */
@Injectable()
export class GetMyStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(userId: string): Promise<StudentWithDetails> {
    const own = await this.studentRepository.findByUserId(userId);
    if (!own) {
      // An account with no student record — a teacher who somehow holds the
      // permission, or a user mid-provisioning. Nothing of theirs exists, and
      // the absence must not fall through into an unscoped read.
      throw new NotFoundException(
        'This account is not linked to a student record',
      );
    }

    const student = await this.studentRepository.findById(own.id);
    if (!student) {
      throw new NotFoundException(
        'This account is not linked to a student record',
      );
    }

    return student;
  }
}
