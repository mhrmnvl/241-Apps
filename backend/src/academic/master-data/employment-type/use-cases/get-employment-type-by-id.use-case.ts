import { Injectable, NotFoundException } from '@nestjs/common';
import { IEmploymentTypeRepository } from '../domain/interfaces/employment-type-repository.interface.js';

@Injectable()
export class GetEmploymentTypeByIdUseCase {
  constructor(
    private readonly employmentTypeRepository: IEmploymentTypeRepository,
  ) {}

  async execute(id: string) {
    const type = await this.employmentTypeRepository.findById(id);
    if (!type) {
      throw new NotFoundException(`Employment type with ID ${id} not found`);
    }
    return type;
  }
}
