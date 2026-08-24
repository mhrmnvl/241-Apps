import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/domain/interfaces/academic-year-repository.interface.js';
import {
  CopyClassroomsResult,
  IClassroomRepository,
} from '../domain/interfaces/classroom-repository.interface.js';

/**
 * Gives a new academic year the classrooms the old one had.
 *
 * A promotion needs somewhere to put students, and building next year's
 * classes by hand is both tedious and the kind of task that gets done
 * halfway. Halfway is the dangerous state: `GeneratePromotionRecommendationUseCase`
 * works out which level follows which from the levels present in the target
 * year, so a year holding only IX makes it treat every IX student as
 * graduating and offer nobody else a destination — confidently, and with no
 * error to notice.
 *
 * Only the classroom travels: a new id, the target year, and the same grade,
 * code, name and capacity. Enrolments do not, because deciding who goes where
 * is exactly what the promotion is for. Nor do a class's officers, who name
 * students that will not be in it.
 */
@Injectable()
export class CopyClassroomsToAcademicYearUseCase {
  private readonly logger = new Logger(
    CopyClassroomsToAcademicYearUseCase.name,
  );

  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): Promise<CopyClassroomsResult> {
    if (sourceAcademicYearId === targetAcademicYearId) {
      throw new BadRequestException(
        'Source and target academic year must be different.',
      );
    }

    const [source, target] = await Promise.all([
      this.academicYearRepository.findById(sourceAcademicYearId),
      this.academicYearRepository.findById(targetAcademicYearId),
    ]);

    // Named rather than numbered: "2026/2027" says what to go and look at.
    if (!source) {
      throw new BadRequestException(
        `Academic year ${sourceAcademicYearId} was not found.`,
      );
    }
    if (!target) {
      throw new BadRequestException(
        `Academic year ${targetAcademicYearId} was not found.`,
      );
    }

    const result = await this.classroomRepository.copyToAcademicYear(
      sourceAcademicYearId,
      targetAcademicYearId,
    );

    // Nothing to copy is a refusal rather than a quiet success. The caller
    // asked for next year to be ready, and an empty source leaves it exactly
    // as unready as before while reporting that the job was done.
    if (result.created === 0 && result.skipped === 0) {
      throw new BadRequestException(
        `Academic year ${source.name} has no classrooms to copy.`,
      );
    }

    this.logger.log(
      `Copied classrooms ${source.name} → ${target.name}: ` +
        `${result.created} created, ${result.skipped} already there`,
    );

    return result;
  }
}
