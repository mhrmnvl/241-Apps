import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceTokenService } from '../../shared/services/device-token.service.js';
import { DeviceEntity } from '../domain/entities/device.entity.js';
import { IDeviceRepository } from '../domain/interfaces/device-repository.interface.js';
import { RegisterDeviceDto } from '../dto/request/register-device.dto.js';

export interface DeviceWithToken {
  device: DeviceEntity;
  /** Shown once. Only the hash is stored, so this is unrecoverable after. */
  token: string;
}

@Injectable()
export class RegisterDeviceUseCase {
  constructor(
    private readonly deviceRepository: IDeviceRepository,
    private readonly tokens: DeviceTokenService,
  ) {}

  async execute(dto: RegisterDeviceDto): Promise<DeviceWithToken> {
    const { token, hash } = this.tokens.issue();

    const device = await this.deviceRepository.create({
      name: dto.name,
      location: dto.location ?? null,
      tokenHash: hash,
      tokenIssuedAt: new Date(),
    });

    return { device, token };
  }
}

@Injectable()
export class RotateDeviceTokenUseCase {
  constructor(
    private readonly deviceRepository: IDeviceRepository,
    private readonly tokens: DeviceTokenService,
  ) {}

  /**
   * The response to a stolen or mislaid tablet: the old token stops working the
   * moment the new one is written, without unregistering the gate or losing its
   * scan history.
   */
  async execute(id: string): Promise<DeviceWithToken> {
    const existing = await this.deviceRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Device not found');
    }

    const { token, hash } = this.tokens.issue();

    const device = await this.deviceRepository.rotateToken(id, {
      tokenHash: hash,
      tokenIssuedAt: new Date(),
    });

    return { device, token };
  }
}
