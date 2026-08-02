import { Injectable, NotFoundException } from '@nestjs/common';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';

@Injectable()
export class GetEducationByIdUseCase {
  constructor(private readonly educationRepository: IEducationRepository) {}

  async execute(id: string) {
    const education = await this.educationRepository.findById(id);
    if (!education)
      throw new NotFoundException(`Education with ID ${id} not found`);
    return education;
  }
}
