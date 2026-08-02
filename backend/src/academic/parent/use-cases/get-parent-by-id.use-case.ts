import { Injectable, NotFoundException } from '@nestjs/common';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';

@Injectable()
export class GetParentByIdUseCase {
  constructor(private readonly parentRepository: IParentRepository) {}

  async execute(id: string) {
    const parent = await this.parentRepository.findById(id);
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);
    return parent;
  }
}
