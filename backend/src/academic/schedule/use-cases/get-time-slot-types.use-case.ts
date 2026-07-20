import { Injectable } from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class GetTimeSlotTypesUseCase {
  constructor(private readonly repo: ITimeSlotRepository) {}

  async execute() {
    return this.repo.findAllTypes();
  }
}
