import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { EnrollmentStatus } from '../../../shared/domain/enums/enrollment-status.enum.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { BulkGenerateReportCardDto } from '../dto/request/bulk-generate-report-card.dto.js';
import { BulkGenerateReportCardResponseDto } from '../dto/response/bulk-generate-report-card-response.dto.js';
import { BULK_GENERATE_ENROLLMENT_LIMIT } from '../constants/report-card.constants.js';
import { GenerateReportCardUseCase } from './generate-report-card.use-case.js';

/**
 * Generates a whole classroom's report cards in one request.
 *
 * Wali kelas otherwise repeat the single-student call once per child, which for
 * a class of thirty is thirty confirmations and no way to tell which ones were
 * missed.
 */
@Injectable()
export class BulkGenerateReportCardsUseCase {
  private readonly logger = new Logger(BulkGenerateReportCardsUseCase.name);

  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly generateReportCardUseCase: GenerateReportCardUseCase,
  ) {}

  async execute(
    dto: BulkGenerateReportCardDto,
  ): Promise<BulkGenerateReportCardResponseDto> {
    const enrollments = await this.enrollmentRepository.findAll({
      classroomId: dto.classroomId,
      semesterId: dto.semesterId,
      status: EnrollmentStatus.ACTIVE,
      page: 1,
      limit: BULK_GENERATE_ENROLLMENT_LIMIT,
    });

    let generated = 0;
    const skippedEnrollmentIds: string[] = [];

    // Sequential on purpose: each generation re-ranks the classroom, and
    // concurrent runs would race on the same rows for no gain at this size.
    for (const enrollment of enrollments.data) {
      try {
        await this.generateReportCardUseCase.execute({
          enrollmentId: enrollment.id,
        });
        generated += 1;
      } catch (error) {
        // A published card is deliberately left alone rather than failing the
        // batch — one already-issued report must not block the other twenty-nine.
        if (error instanceof ConflictException) {
          skippedEnrollmentIds.push(enrollment.id);
          continue;
        }
        throw error;
      }
    }

    this.logger.log(
      `Bulk generated report cards for classroom ${dto.classroomId} — generated: ${generated}, skipped: ${skippedEnrollmentIds.length}`,
    );

    return {
      total: enrollments.data.length,
      generated,
      skipped: skippedEnrollmentIds.length,
      skippedEnrollmentIds,
    };
  }
}
