import { Injectable } from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';

@Injectable()
export class GetStatusesUseCase {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(search?: string) {
    return this.statusRepository.findMany(search);
  }
}
