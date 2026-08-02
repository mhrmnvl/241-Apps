import type { ProfileUpdateInput } from '../../../platform/profile/domain/entities/profile.entity.js';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class UpdateTeacherProfileUseCase {
  private readonly logger = new Logger(UpdateTeacherProfileUseCase.name);

  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(id: string, dto: UpdateProfileDto) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);

    if (dto.nik) {
      const duplicate = await this.teacherRepository.findProfileByUserId(
        teacher.user.id,
        dto.nik,
      );
      if (duplicate)
        throw new ConflictException(`NIK "${dto.nik}" is already registered`);
    }

    const { birthDate, ...rest } = dto;
    const profileInput: ProfileUpdateInput = {
      ...rest,
      ...(birthDate && { birthDate: new Date(birthDate) }),
    };

    const profile = await this.teacherRepository.updateProfile(
      teacher.user.id,
      profileInput,
    );
    this.logger.log(`Teacher profile updated: ${id}`);
    return profile;
  }
}
