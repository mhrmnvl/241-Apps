import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class DeleteSemesterUseCase {
  private readonly logger = new Logger(DeleteSemesterUseCase.name);

  constructor(private readonly semesterRepository: ISemesterRepository) {}

  async execute(id: string): Promise<void> {
    const semester = await this.semesterRepository.findById(id);
    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    if (semester.isActive) {
      throw new BadRequestException(
        'Cannot delete an active semester. Deactivate it first.',
      );
    }

    /**
     * Everything filed under the term, not just its enrolments.
     *
     * This asked `hasRelatedData`, which counts enrolments alone, so a term
     * holding a full timetable — teaching assignments, homeroom teachers, class
     * structures, calendar entries — was deletable as long as no student had
     * been enrolled yet. That is exactly the state a term is in while it is
     * being prepared, and deleting it there is the most expensive moment to do
     * it: the work is done and the soft delete hides it without touching a
     * single one of those rows, which keep pointing at a semester no screen
     * lists any more.
     *
     * Same question the move guard asks, so the two cannot disagree about what
     * "in use" means.
     */
    const dependent = await this.semesterRepository.findFirstDependent(id);
    if (dependent) {
      throw new BadRequestException(
        `Cannot delete a semester that has ${dependent}.`,
      );
    }

    await this.semesterRepository.softDelete(id);
    this.logger.log(`Semester soft-deleted: ${id}`);
  }
}
