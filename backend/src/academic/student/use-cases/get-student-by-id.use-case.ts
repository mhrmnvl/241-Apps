import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  StudentRepository,
  RequestUser,
} from '../repositories/student.repository.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

@Injectable()
export class GetStudentByIdUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(
    id: string,
    requester?: RequestUser,
  ): Promise<StudentWithDetails> {
    if (requester) {
      const isStudent = await this.repo.isStudent(requester.id);
      if (isStudent) {
        const own = await this.repo.findByUserId(requester.id);
        if (!own)
          throw new ForbiddenException(
            'Student account is not linked to an active student record',
          );
        if (own.id !== id)
          throw new ForbiddenException(
            'You can only access your own student data',
          );
      }
    }

    const student = await this.repo.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }
}
