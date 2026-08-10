import { BadRequestException, Injectable } from '@nestjs/common';
import { CredentialWithCode } from '../domain/entities/credential.entity.js';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';

/** A print run is a class or a staff list, not the whole school. */
const MAX_PRINT_BATCH = 200;

@Injectable()
export class GetCredentialsForPrintUseCase {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  /**
   * The only read that returns `code`, because the card sheet cannot be printed
   * without it. Guarded by an explicit user list rather than a filter, so
   * dumping every code in the school takes deliberate effort rather than an
   * empty query string.
   */
  async execute(userIds: string[]): Promise<CredentialWithCode[]> {
    if (userIds.length === 0) {
      throw new BadRequestException('Select at least one person to print for');
    }

    if (userIds.length > MAX_PRINT_BATCH) {
      throw new BadRequestException(
        `Print at most ${MAX_PRINT_BATCH} cards at a time`,
      );
    }

    return this.credentialRepository.findForPrint(userIds);
  }
}
