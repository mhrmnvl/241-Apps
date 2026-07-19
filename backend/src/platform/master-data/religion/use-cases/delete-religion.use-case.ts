import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IReligionRepository } from '../domain/interfaces/religion-repository.interface.js';

@Injectable()
export class DeleteReligionUseCase {
  private readonly logger = new Logger(DeleteReligionUseCase.name);

  constructor(private readonly repository: IReligionRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Religion with ID ${id} not found');
    }

    await this.repository.softDelete(id);
    this.logger.log(`Religion deleted: ${item.name}`);
  }
}
