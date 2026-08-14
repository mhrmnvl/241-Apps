import { BadRequestException } from '@nestjs/common';
import { ClassroomCapacityService } from './classroom-capacity.service.js';
import type { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';
import type { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

/**
 * Capacity used to be checked in exactly one of the four operations that put a
 * student in a classroom, and the screen people actually use went through one
 * of the other three — capped in the browser instead.
 *
 * These tests are about the arithmetic that makes a single check usable by all
 * four: it takes how many are arriving, so a batch is judged as a batch. The
 * old single-enrolment form, `activeCount >= capacity`, is right only when
 * exactly one student is arriving; asked about twenty it would wave through
 * nineteen too many.
 */
describe('ClassroomCapacityService', () => {
  function serviceWith(capacity: number | null, activeCount: number) {
    const classroomRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(
          capacity === null ? null : { id: 'cls-1', capacity },
        ),
    } as unknown as IClassroomRepository;

    const countActiveByClassroomAndSemester = jest
      .fn()
      .mockResolvedValue(activeCount);
    const enrollmentRepository = {
      countActiveByClassroomAndSemester,
    } as unknown as IEnrollmentRepository;

    return {
      service: new ClassroomCapacityService(
        classroomRepository,
        enrollmentRepository,
      ),
      countActiveByClassroomAndSemester,
    };
  }

  function assert(service: ClassroomCapacityService, incoming: number) {
    return service.assertRoomFor({
      classroomId: 'cls-1',
      semesterId: 'sem-1',
      incoming,
    });
  }

  it('allows a batch that exactly fills the room', async () => {
    const { service } = serviceWith(30, 28);
    await expect(assert(service, 2)).resolves.toBeUndefined();
  });

  it('refuses a batch that would overshoot, even by one', async () => {
    const { service } = serviceWith(30, 28);
    await expect(assert(service, 3)).rejects.toThrow(BadRequestException);
  });

  /**
   * The case the browser cannot cover: two clerks each loaded a page saying
   * there was room for two, and each is adding two.
   */
  it('refuses the second of two batches that were each fine when the page loaded', async () => {
    const first = serviceWith(30, 28);
    await expect(assert(first.service, 2)).resolves.toBeUndefined();

    const second = serviceWith(30, 30); // the first batch has landed
    await expect(assert(second.service, 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('says how much room there is, not just that it is full', async () => {
    const { service } = serviceWith(30, 28);
    await expect(assert(service, 5)).rejects.toThrow(
      /28 already enrolled, room for 2 more, 5 requested/,
    );
  });

  it('treats capacity 0 as unlimited, as the enrolment path always has', async () => {
    const { service } = serviceWith(0, 500);
    await expect(assert(service, 100)).resolves.toBeUndefined();
  });

  it('does not block when the classroom cannot be found', async () => {
    const { service } = serviceWith(null, 0);
    await expect(assert(service, 1)).resolves.toBeUndefined();
  });

  it('does not query at all when nobody is arriving', async () => {
    const { service, countActiveByClassroomAndSemester } = serviceWith(30, 30);

    await expect(assert(service, 0)).resolves.toBeUndefined();
    expect(countActiveByClassroomAndSemester).not.toHaveBeenCalled();
  });
});
