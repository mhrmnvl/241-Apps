import { Injectable, NotFoundException } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository.js';

@Injectable()
export class GetParentByIdUseCase {
  constructor(private readonly repository: ParentRepository) {}

  async execute(id: string) {
    const parent = await this.repository.findById(id);
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);
    return parent;
  }
}
