import {
  BadRequestException,
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

    // Compared against what is stored, not only against what was sent: an edit
    // that moves the end date alone would otherwise be judged on its own and
    // could land before a start date it never mentioned.
    const checkStartDate = dto.startDate ?? wave.startDate;
    const checkEndDate = dto.endDate ?? wave.endDate;
    if (checkStartDate && checkEndDate) {
      if (new Date(checkEndDate) <= new Date(checkStartDate)) {
        throw new BadRequestException('End date must be after start date');
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
