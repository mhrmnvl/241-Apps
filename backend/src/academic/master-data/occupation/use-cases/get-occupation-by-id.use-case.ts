import { Injectable, NotFoundException } from '@nestjs/common';
import { IOccupationRepository } from '../domain/interfaces/occupation-repository.interface.js';

@Injectable()
export class GetOccupationByIdUseCase {
  constructor(private readonly occupationRepository: IOccupationRepository) {}

  async execute(id: string) {
    const occupation = await this.occupationRepository.findById(id);
    if (!occupation)
      throw new NotFoundException(`Occupation with ID ${id} not found`);
    return occupation;
  }
}
