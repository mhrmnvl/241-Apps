import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import type { BulkGraduationResult } from '../domain/interfaces/graduation-repository.interface.js';
import { BulkGraduationDto } from '../dto/request/bulk-graduation.dto.js';

/**
 * Graduates a cohort in one run.
 *
 * Graduating a year one student at a time is dozens of clicks and a partially
 * finished year if someone is interrupted; this is the operation the school
 * actually performs at the end of an academic year.
 */
@Injectable()
export class BulkGraduateStudentsUseCase {
  private readonly logger = new Logger(BulkGraduateStudentsUseCase.name);

  constructor(private readonly graduationRepository: IGraduationRepository) {}

  async execute(dto: BulkGraduationDto): Promise<BulkGraduationResult> {
    if (dto.students.length === 0) {
      throw new BadRequestException('No students selected');
    }

    const ids = dto.students.map((s) => s.studentId);
    if (new Set(ids).size !== ids.length) {
      // Left unchecked, a duplicated id would be graduated once and then
      // counted as skipped, which reads as "already graduated" and hides that
      // the caller sent the same student twice.
      throw new BadRequestException('Duplicate students in the request');
    }

    // Derived, not taken from the request: a client that sent the wrong year
    // would file a whole cohort under it, and nothing downstream would notice.
    const academicYearId =
      await this.graduationRepository.findActiveAcademicYearId();
    if (!academicYearId) {
      throw new BadRequestException(
        'No active semester; set one before graduating a cohort',
      );
    }

    const result = await this.graduationRepository.executeBulk({
      academicYearId,
      ...(dto.graduationDate && {
        graduationDate: new Date(dto.graduationDate),
      }),
      students: dto.students,
    });

    this.logger.log(
      `Bulk graduation: ${result.graduated} graduated, ${result.skipped} skipped`,
    );

    return result;
  }
}
