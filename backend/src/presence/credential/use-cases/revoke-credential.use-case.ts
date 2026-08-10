import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CredentialEntity } from '../domain/entities/credential.entity.js';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { RevokeCredentialDto } from '../dto/request/revoke-credential.dto.js';

@Injectable()
export class RevokeCredentialUseCase {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  /**
   * Revoking ends the person's expected-days window, so a pegawai who leaves
   * and whose card is never revoked keeps appearing as absent every working day
   * (ADR-0007). That is the most likely source of wrong data in this design and
   * belongs in the TU's operating instructions, not only here.
   */
  async execute(
    id: string,
    dto: RevokeCredentialDto,
  ): Promise<CredentialEntity> {
    const credential = await this.credentialRepository.findById(id);

    if (!credential) {
      throw new NotFoundException('Card not found');
    }

    if (credential.status !== 'ACTIVE') {
      throw new ConflictException('This card is already inactive');
    }

    return this.credentialRepository.revoke(id, {
      revokedAt: new Date(),
      revokedReason: dto.reason,
    });
  }
}
