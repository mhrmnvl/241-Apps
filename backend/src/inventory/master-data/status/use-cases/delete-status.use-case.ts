import { Injectable, NotFoundException } from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';

@Injectable()
export class DeleteStatusUseCase {
  constructor(private readonly repository: IStatusRepository) {}

  async execute(id: string) {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    return this.repository.delete(id);
  }
}
