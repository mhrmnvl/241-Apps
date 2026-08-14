import { Injectable } from '@nestjs/common';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

/**
 * Present when the caller is reading their own record rather than the
 * school's. It is a use-case argument and not a DTO field on purpose: a DTO is
 * the HTTP shape, and anything on it is something a caller can send.
 */
export interface SelfServiceScope {
  studentId: string;
}

@Injectable()
export class GetReportCardsUseCase {
  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(query: ReportCardQueryDto, scope?: SelfServiceScope) {
    // The caller's own identity is applied *after* their query, never before.
    // Spreading it the other way would let `?studentId=<someone else>` win, and
    // the result would look entirely ordinary on screen.
    //
    // `isPublished` is forced the same way: a draft is a report card the school
    // has not yet stood behind, and a student asking for `isPublished=false`
    // must not be handed one.
    return this.reportCardRepository.findAll({
      page: query.page,
      limit: query.limit,
      studentId: query.studentId,
      classroomId: query.classroomId,
      semesterId: query.semesterId,
      isPublished: query.isPublished,
      ...(scope && { studentId: scope.studentId, isPublished: true }),
    });
  }
}
