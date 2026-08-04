import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../shared/domain/entities/user.entity.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class ToggleStudentActiveUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, isActive: boolean): Promise<UserEntity> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new StudentNotFoundException(id);
    }
    return this.studentRepository.toggleUserActive(student.user.id, isActive);
  }
}
