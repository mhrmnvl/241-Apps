import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { ProfileRepository } from '../index.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';

@Injectable()
export class AddProfileAddressUseCase {
  private readonly logger = new Logger(AddProfileAddressUseCase.name);

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly addressRepository: ProfileAddressRepository,
  ) {}

  async execute(userId: string, dto: CreateAddressDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    const student = await this.addressRepository.findStudentByUserId(userId);
    const teacher = !student
      ? await this.addressRepository.findTeacherByUserId(userId)
      : null;

    if (!student && !teacher)
      throw new NotFoundException(
        'No student or teacher record found for this user',
      );

    if (dto.isPrimary) {
      if (student)
        await this.addressRepository.clearPrimaryForStudent(student.id);
      else if (teacher)
        await this.addressRepository.clearPrimaryForTeacher(teacher.id);
    }

    const address = await this.addressRepository.create(dto, {
      ...(student ? { studentId: student.id } : { teacherId: teacher!.id }),
    });

    this.logger.log(`Address added for user ${userId}`);
    return address;
  }
}
