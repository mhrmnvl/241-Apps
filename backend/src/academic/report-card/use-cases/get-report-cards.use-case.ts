import { Injectable } from '@nestjs/common';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GetReportCardsUseCase {
  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(query: ReportCardQueryDto) {
    return this.reportCardRepository.findAll({
      page: query.page,
      limit: query.limit,
      studentId: query.studentId,
      classroomId: query.classroomId,
      semesterId: query.semesterId,
      isPublished: query.isPublished,
    });
  }
}
