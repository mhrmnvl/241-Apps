import { Injectable } from '@nestjs/common';
import { EmploymentTypeQueryDto } from '../dto/request/employment-type-query.dto.js';
import { IEmploymentTypeRepository } from '../interfaces/employment-type-repository.interface.js';

@Injectable()
export class GetEmploymentTypesUseCase {
  constructor(private readonly repo: IEmploymentTypeRepository) {}

  async execute(query: EmploymentTypeQueryDto) {
    return this.repo.findAll(query);
  }
}
