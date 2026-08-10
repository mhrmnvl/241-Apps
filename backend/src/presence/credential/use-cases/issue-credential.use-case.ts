import { ConflictException, Injectable } from '@nestjs/common';
import { CredentialWithCode } from '../domain/entities/credential.entity.js';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { IssueCredentialDto } from '../dto/request/issue-credential.dto.js';
import { CredentialCodeService } from '../services/credential-code.service.js';

@Injectable()
export class IssueCredentialUseCase {
  constructor(
    private readonly credentialRepository: ICredentialRepository,
    private readonly codes: CredentialCodeService,
  ) {}

  /**
   * Issuing is what starts a person's attendance history: a day before their
   * first card is `NOT_EXPECTED`, not absent (ADR-0007).
   */
  async execute(
    dto: IssueCredentialDto,
    issuedBy: string,
  ): Promise<CredentialWithCode> {
    const active = await this.credentialRepository.findActiveByUserId(
      dto.userId,
    );

    if (active) {
      throw new ConflictException(
        'This person already holds an active card. Replace it instead of issuing a second.',
      );
    }

    return this.credentialRepository.create({
      userId: dto.userId,
      subjectType: dto.subjectType,
      code: this.codes.generate(),
      issuedBy,
    });
  }
}
