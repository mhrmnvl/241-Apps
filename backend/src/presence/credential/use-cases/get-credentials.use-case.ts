import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResponse,
  PaginatedResult,
} from '../../../shared/domain/interfaces/repository.interface.js';
import { CredentialWithHolder } from '../domain/entities/credential.entity.js';
import {
  CredentialQueryInput,
  ICredentialRepository,
} from '../domain/interfaces/credential-repository.interface.js';

function paginate<T>(result: PaginatedResult<T>): PaginatedResponse<T> {
  const { data, total, page, limit } = result;
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

@Injectable()
export class GetCredentialsUseCase {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  /** Never returns `code` — only issue, replace, and the print payload do. */
  async execute(
    query: CredentialQueryInput,
  ): Promise<PaginatedResponse<CredentialWithHolder>> {
    return paginate(await this.credentialRepository.findAll(query));
  }
}

@Injectable()
export class GetCredentialByIdUseCase {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  async execute(id: string): Promise<CredentialWithHolder> {
    const credential = await this.credentialRepository.findById(id);

    if (!credential) {
      throw new NotFoundException('Card not found');
    }

    return credential;
  }
}
