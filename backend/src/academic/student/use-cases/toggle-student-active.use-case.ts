import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../../shared/domain/entities/user.entity.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';

@Injectable()
export class ToggleStudentActiveUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, isActive: boolean): Promise<UserEntity> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }
    return this.studentRepository.toggleUserActive(student.user.id, isActive);
  }
}
