import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GetReportCardDetailUseCase } from './get-report-card-detail.use-case.js';

/**
 * The caller's own report card, opened from their own list.
 *
 * The id arrives from the screen, so it is checked rather than trusted: the
 * card is fetched, then its enrolment's student is compared against the
 * caller's own student record. Naming a classmate's card is answered exactly
 * as naming one that does not exist — the two must be indistinguishable, or
 * the refusal itself reports whose card that id belongs to.
 *
 * Unpublished is also not theirs to see. `report-cards.read-own` is defined as
 * published-only, because a draft is a report card the school has not yet stood
 * behind, and the list this detail is opened from returns nothing else.
 */
@Injectable()
export class GetMyReportCardDetailUseCase {
  constructor(
    private readonly getReportCardDetail: GetReportCardDetailUseCase,
    private readonly reportCardRepository: IReportCardRepository,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(id: string, userId: string) {
    const notFound = () =>
      new NotFoundException(`ReportCard with ID ${id} not found`);

    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);
    // No student record is not an error on the caller's part — there is simply
    // nothing of theirs. It must never widen into an unscoped read.
    if (!studentId) throw notFound();

    // Ownership is settled before the card is read, so a card belonging to
    // somebody else is never loaded, let alone returned.
    const ownership = await this.reportCardRepository.findOwnership(id);
    if (!ownership || ownership.studentId !== studentId) throw notFound();

    const detail = await this.getReportCardDetail.execute(id);
    if (!detail.isPublished) throw notFound();

    return detail;
  }
}
