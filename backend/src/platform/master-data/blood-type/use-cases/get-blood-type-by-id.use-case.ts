import { Injectable, NotFoundException } from '@nestjs/common';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class GetBloodTypeByIdUseCase {
  constructor(private readonly repository: IBloodTypeRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('BloodType with ID ${id} not found');
    }
    return item;
  }
}
