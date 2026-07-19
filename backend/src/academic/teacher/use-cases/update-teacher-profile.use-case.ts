import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Injectable()
export class UpdateTeacherProfileUseCase {
  private readonly logger = new Logger(UpdateTeacherProfileUseCase.name);

  constructor(private readonly repository: TeacherRepository) {}

  async execute(id: string, dto: UpdateProfileDto) {
    const teacher = await this.repository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);

    if (dto.nik) {
      const duplicate = await this.repository.findProfileByUserId(
        teacher.user.id,
        dto.nik,
      );
      if (duplicate)
        throw new ConflictException(`NIK "${dto.nik}" is already registered`);
    }

    const profile = await this.repository.updateProfile(teacher.user.id, dto);
    this.logger.log(`Teacher profile updated: ${id}`);
    return profile;
  }
}
