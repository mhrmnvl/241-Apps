import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTimeSlotTypeDto } from '../dto/request/update-time-slot-type.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class UpdateTimeSlotTypeUseCase {
  constructor(private readonly repository: ITimeSlotRepository) {}

  async execute(id: string, dto: UpdateTimeSlotTypeDto) {
    const type = await this.repository.findTypeById(id);
    if (!type) {
      throw new NotFoundException('Tipe jam tidak ditemukan');
    }
    if (dto.code) {
      const dup = await this.repository.findTypeByCode(dto.code, id);
      if (dup) {
        throw new ConflictException(`Kode tipe "${dto.code}" sudah digunakan`);
      }
    }
    return this.repository.updateType(id, dto);
  }
}
