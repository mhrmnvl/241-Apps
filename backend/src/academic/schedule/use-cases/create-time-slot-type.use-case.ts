import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTimeSlotTypeDto } from '../dto/request/create-time-slot-type.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class CreateTimeSlotTypeUseCase {
  constructor(private readonly repo: ITimeSlotRepository) {}

  async execute(dto: CreateTimeSlotTypeDto) {
    const existing = await this.repo.findTypeByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Kode tipe "${dto.code}" sudah digunakan`);
    }
    return this.repo.createType(dto);
  }
}
