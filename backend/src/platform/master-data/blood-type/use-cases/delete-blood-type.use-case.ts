import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class DeleteBloodTypeUseCase {
  private readonly logger = new Logger(DeleteBloodTypeUseCase.name);

  constructor(private readonly repository: IBloodTypeRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('BloodType with ID ${id} not found');
    }

    await this.repository.softDelete(id);
    this.logger.log(`BloodType deleted: ${item.name}`);
  }
}
