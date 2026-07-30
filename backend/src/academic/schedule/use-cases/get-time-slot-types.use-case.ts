import { Injectable } from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class GetTimeSlotTypesUseCase {
  constructor(private readonly repository: ITimeSlotRepository) {}

  async execute() {
    return this.repository.findAllTypes();
  }
}
