import { Injectable, NotFoundException } from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';
import { UpdateStatusDto } from '../dto/request/status.dto.js';

@Injectable()
export class UpdateStatusUseCase {
  constructor(private readonly repository: IStatusRepository) {}

  async execute(id: string, dto: UpdateStatusDto) {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    return this.repository.update(id, {
      code: dto.code,
      name: dto.name,
      allowTransactions: dto.allowTransactions ?? true,
    });
  }
}
