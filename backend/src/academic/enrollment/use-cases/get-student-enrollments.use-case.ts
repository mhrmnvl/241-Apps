import { Injectable } from '@nestjs/common';
import { StudentEnrollmentQueryDto } from '../dto/request/student-enrollment-query.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class GetStudentEnrollmentsUseCase {
  constructor(private readonly repo: IEnrollmentRepository) {}
  async execute(query: StudentEnrollmentQueryDto) {
    return this.repo.findAll(query);
  }
}
