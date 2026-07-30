import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { UpdateAdmissionWaveDto } from '../dto/request/update-admission-wave.dto.js';

@Injectable()
export class UpdateAdmissionWaveUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(id: string, dto: UpdateAdmissionWaveDto) {
    const wave = await this.repository.findById(id);
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }

    if (dto.code && dto.code !== wave.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Kode gelombang '${dto.code}' sudah dipakai`,
        );
      }
    }

    const { startDate, endDate, ...rest } = dto;
    const updated = await this.repository.update(id, {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });
    return serializeWave(updated);
  }
}
