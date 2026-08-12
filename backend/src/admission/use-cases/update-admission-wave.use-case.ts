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
  constructor(
    private readonly admissionWaveRepository: IAdmissionWaveRepository,
  ) {}

  async execute(id: string, dto: UpdateAdmissionWaveDto) {
    const wave = await this.admissionWaveRepository.findById(id);
    if (!wave) {
      throw new NotFoundException('Admission wave not found');
    }

    if (dto.code && dto.code !== wave.code) {
      const existing = await this.admissionWaveRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Admission wave code '${dto.code}' is already in use`,
        );
      }
    }

    const { startDate, endDate, ...rest } = dto;
    const updated = await this.admissionWaveRepository.update(id, {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });
    return serializeWave(updated);
  }
}
