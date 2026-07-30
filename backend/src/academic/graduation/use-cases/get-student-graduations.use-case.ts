import { Injectable } from '@nestjs/common';
import { StudentGraduationQueryDto } from '../dto/request/student-graduation-query.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class GetStudentGraduationsUseCase {
  constructor(private readonly repository: IGraduationRepository) {}
  async execute(query: StudentGraduationQueryDto) {
    return this.repository.findAll(query);
  }
}
