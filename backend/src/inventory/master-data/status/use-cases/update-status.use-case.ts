import { Injectable, NotFoundException } from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';
import { UpdateStatusDto } from '../dto/request/update-status.dto.js';

@Injectable()
export class UpdateStatusUseCase {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(id: string, dto: UpdateStatusDto) {
    const status = await this.statusRepository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    return this.statusRepository.update(id, {
      code: dto.code,
      name: dto.name,
      allowTransactions: dto.allowTransactions ?? true,
      systemKey: dto.systemKey !== undefined ? dto.systemKey : undefined,
    });
  }
}
