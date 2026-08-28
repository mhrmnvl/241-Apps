import { Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../../../academic/enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentIdentityReadPort } from '../../../academic/student/domain/interfaces/student-identity-read.port.js';
import {
  AnnouncementWithDetails,
  IAnnouncementRepository,
} from '../domain/interfaces/announcement-repository.interface.js';
import { AnnouncementQueryDto } from '../dto/request/announcement-query.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';

/**
 * The noticeboard as this caller sees it.
 *
 * `announcements.read` is the whole board — every notice the school has ever
 * posted, including the ones addressed to one class. A student holding it
 * would read "Persiapan Ujian Akhir Kelas IX" in their first year, which is
 * not secret but is not theirs either, and on a list screen it reads as the
 * school being unable to tell one class from another.
 *
 * So this answers from the caller's own enrolment: everything addressed to the
 * whole school, plus everything addressed to their class. Any `classroomId` the
 * caller tried to pass is dropped — the audience is theirs to be told, not to
 * choose.
 *
 * Somebody with no enrolment this term still gets the school-wide notices;
 * that is the honest answer for a pupil between terms, and it is the same
 * board the front gate shows.
 */
@Injectable()
export class GetMyAnnouncementsUseCase {
  constructor(
    private readonly announcementRepository: IAnnouncementRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(
    userId: string,
    query: AnnouncementQueryDto,
  ): Promise<PaginatedResult<AnnouncementWithDetails>> {
    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);
    const enrollment = studentId
      ? await this.enrollmentRepository.findActiveEnrollment(studentId)
      : null;

    return this.announcementRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      // Never `query.classroomId`: the caller does not choose their audience.
      // `null` where they have no enrolment — school-wide notices only, rather
      // than the whole board.
      audienceClassroomId: enrollment?.classroomId ?? null,
    });
  }
}
