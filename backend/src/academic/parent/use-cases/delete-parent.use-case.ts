import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';

@Injectable()
export class DeleteParentUseCase {
  private readonly logger = new Logger(DeleteParentUseCase.name);

  constructor(private readonly parentRepository: IParentRepository) {}

  async execute(id: string): Promise<void> {
    const parent = await this.parentRepository.findById(id);
    if (!parent) throw new NotFoundException(`Parent with ID ${id} not found`);

    await this.parentRepository.softDelete(id);
    this.logger.log(`Parent soft-deleted: ${id}`);
  }
}
