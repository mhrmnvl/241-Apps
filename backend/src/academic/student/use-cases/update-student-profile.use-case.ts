import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class UpdateStudentProfileUseCase {
  private readonly logger = new Logger(UpdateStudentProfileUseCase.name);

  constructor(private readonly repo: StudentRepository) {}

  async execute(id: string, dto: UpdateProfileDto) {
    const student = await this.repo.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    const updated = await this.repo.updateProfile(id, dto);
    this.logger.log(`Student profile updated: ${id}`);
    return updated;
  }
}
