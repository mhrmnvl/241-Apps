import { Injectable } from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';
import { CreateStatusDto } from '../dto/request/create-status.dto.js';

@Injectable()
export class CreateStatusUseCase {
  constructor(private readonly repository: IStatusRepository) {}

  async execute(dto: CreateStatusDto) {
    return this.repository.create({
      code: dto.code,
      name: dto.name,
      allowTransactions: dto.allowTransactions ?? true,
      systemKey: dto.systemKey ?? null,
    });
  }
}
