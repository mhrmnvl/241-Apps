import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { IStudentRepository } from '../index.js';

@Injectable()
export class UpdateStudentProfileUseCase {
  private readonly logger = new Logger(UpdateStudentProfileUseCase.name);

  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, dto: UpdateProfileDto) {
    const student = await this.studentRepository.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    const { birthDate, ...rest } = dto;
    const updated = await this.studentRepository.updateProfile(id, {
      ...rest,
      ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
    });
    this.logger.log(`Student profile updated: ${id}`);
    return updated;
  }
}
