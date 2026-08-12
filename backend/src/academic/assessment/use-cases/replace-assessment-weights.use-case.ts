import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ITeachingAssignmentRepository } from '../../teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.js';
import { ASSESSMENT_WEIGHT_TOTAL } from '../constants/assessment.constants.js';
import {
  AssessmentWeightEntity,
  IAssessmentWeightRepository,
} from '../domain/interfaces/assessment-weight-repository.interface.js';
import { ReplaceAssessmentWeightsDto } from '../dto/request/replace-assessment-weights.dto.js';

@Injectable()
export class ReplaceAssessmentWeightsUseCase {
  constructor(
    private readonly assessmentWeightRepository: IAssessmentWeightRepository,
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(
    dto: ReplaceAssessmentWeightsDto,
  ): Promise<AssessmentWeightEntity[]> {
    const assignment = await this.teachingAssignmentRepository.findById(
      dto.teachingAssignmentId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `Teaching assignment with ID ${dto.teachingAssignmentId} not found`,
      );
    }

    const seen = new Set<string>();
    for (const record of dto.weights) {
      if (seen.has(record.type)) {
        throw new BadRequestException(
          `Assessment type ${record.type} is listed more than once`,
        );
      }
      seen.add(record.type);
    }

    // Enforced here rather than left to the calculator, which renormalises
    // whatever it is given. Renormalising is right for a type not yet
    // assessed; it would be wrong as a way to paper over weights the teacher
    // never meant to add up.
    const total = dto.weights.reduce((sum, record) => sum + record.weight, 0);
    if (Math.round(total * 100) / 100 !== ASSESSMENT_WEIGHT_TOTAL) {
      throw new BadRequestException(
        `Assessment weights must total ${ASSESSMENT_WEIGHT_TOTAL}, received ${total}`,
      );
    }

    return this.assessmentWeightRepository.replaceForTeachingAssignment({
      teachingAssignmentId: dto.teachingAssignmentId,
      // Zero-weight rows carry no meaning; leaving them out keeps the stored
      // set to the types that actually count.
      weights: dto.weights.filter((record) => record.weight > 0),
    });
  }
}
