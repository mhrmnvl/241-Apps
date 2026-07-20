import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { AdmissionWaveQueryDto } from '../dto/request/admission-wave-query.dto.js';
import { CreateAdmissionWaveDto } from '../dto/request/create-admission-wave.dto.js';
import { UpdateAdmissionWaveDto } from '../dto/request/update-admission-wave.dto.js';

@Injectable()
export class GetAdmissionWavesUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(query: AdmissionWaveQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);

    return {
      data: data.map(serializeWave),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class GetAdmissionWaveByIdUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(id: string) {
    const wave = await this.repository.findById(id);
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    return serializeWave(wave);
  }
}

@Injectable()
export class CreateAdmissionWaveUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(dto: CreateAdmissionWaveDto) {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Kode gelombang '${dto.code}' sudah dipakai`);
    }

    const created = await this.repository.create({
      name: dto.name,
      code: dto.code,
      academicYearId: dto.academicYearId,
      schoolUnitId: dto.schoolUnitId ?? null,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      quota: dto.quota,
      registrationFee: dto.registrationFee,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    return serializeWave(created);
  }
}

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

@Injectable()
export class DeleteAdmissionWaveUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(id: string) {
    const wave = await this.repository.findById(id);
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    if (wave._count.applications > 0) {
      throw new ConflictException(
        'Gelombang dengan pendaftar tidak dapat dihapus. Nonaktifkan saja.',
      );
    }

    return this.repository.softDelete(id);
  }
}
