import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class UpdateStudentProfileUseCase {
  private readonly logger = new Logger(UpdateStudentProfileUseCase.name);

  constructor(private readonly repository: StudentRepository) {}

  async execute(id: string, dto: UpdateProfileDto) {
    const student = await this.repository.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    const updated = await this.repository.updateProfile(id, dto);
    this.logger.log(`Student profile updated: ${id}`);
    return updated;
  }
}
