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

    const hasData = await this.semesterRepository.hasRelatedData(id);
    if (hasData) {
      throw new BadRequestException(
        'Cannot delete semester that has enrollment data',
      );
    }

    await this.semesterRepository.softDelete(id);
    this.logger.log(`Semester soft-deleted: ${id}`);
  }
}
