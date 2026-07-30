import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository.js';

@Injectable()
export class DeleteParentUseCase {
  private readonly logger = new Logger(DeleteParentUseCase.name);

  constructor(private readonly repository: ParentRepository) {}

  async execute(id: string): Promise<void> {
    const parent = await this.repository.findById(id);
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);

    await this.repository.softDelete(id);
    this.logger.log(`Parent soft-deleted: ${id}`);
  }
}
