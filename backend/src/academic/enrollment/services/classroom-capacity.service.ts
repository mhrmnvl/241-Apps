import { BadRequestException, Injectable } from '@nestjs/common';
import { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

/**
 * Whether a classroom has room for more students.
 *
 * Four operations put a student into a classroom — enrol one, enrol many,
 * transfer one, transfer many — and until now exactly one of them checked. The
 * screen that adds students uses the bulk path and caps the selection itself,
 * so the rule was being enforced in the browser on the route people actually
 * take, and nowhere at all on the other three.
 *
 * That fails without anyone doing anything unusual: two clerks adding students
 * at the same time each hold a `remainingCapacity` that was true when the page
 * loaded, and both are within it.
 *
 * `capacity: 0` means unlimited. That is the reading the single-enrolment path
 * has always used, and changing it here would quietly close classrooms that
 * were deliberately left open.
 */
@Injectable()
export class ClassroomCapacityService {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  /**
   * Throws unless `incoming` more students fit in the classroom.
   *
   * `incoming` is what the caller is about to add, counted after its own
   * filtering: students already enrolled there are not incoming, and neither
   * is a transfer that leaves someone where they already are.
   */
  async assertRoomFor(input: {
    classroomId: string;
    semesterId: string;
    incoming: number;
  }): Promise<void> {
    if (input.incoming <= 0) return;

    const classroom = await this.classroomRepository.findById(
      input.classroomId,
    );
    if (!classroom || classroom.capacity <= 0) return;

    const activeCount =
      await this.enrollmentRepository.countActiveByClassroomAndSemester(
        input.classroomId,
        input.semesterId,
      );

    if (activeCount + input.incoming > classroom.capacity) {
      const room = Math.max(classroom.capacity - activeCount, 0);
      throw new BadRequestException(
        `Classroom capacity limit of ${classroom.capacity} reached: ` +
          `${activeCount} already enrolled, room for ${room} more, ${input.incoming} requested`,
      );
    }
  }
}
