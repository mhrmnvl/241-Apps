import { Module } from '@nestjs/common';
import { ICredentialRepository } from './domain/interfaces/credential-repository.interface.js';
import { PrismaCredentialRepository } from './infrastructure/persistence/prisma-credential.repository.js';
import { CredentialController } from './presentation/credential.controller.js';
import { CredentialCodeService } from './services/credential-code.service.js';
import { GetCredentialsForPrintUseCase } from './use-cases/get-credentials-for-print.use-case.js';
import {
  GetCredentialByIdUseCase,
  GetCredentialsUseCase,
} from './use-cases/get-credentials.use-case.js';
import { IssueCredentialUseCase } from './use-cases/issue-credential.use-case.js';
import { ReplaceCredentialUseCase } from './use-cases/replace-credential.use-case.js';
import { RevokeCredentialUseCase } from './use-cases/revoke-credential.use-case.js';

/**
 * Exports the port because the scan path resolves a presented code through it,
 * and the day-status service asks it whether a person held a card on a date.
 */
@Module({
  controllers: [CredentialController],
  providers: [
    { provide: ICredentialRepository, useClass: PrismaCredentialRepository },
    CredentialCodeService,
    GetCredentialsUseCase,
    GetCredentialByIdUseCase,
    GetCredentialsForPrintUseCase,
    IssueCredentialUseCase,
    RevokeCredentialUseCase,
    ReplaceCredentialUseCase,
  ],
  exports: [ICredentialRepository],
})
export class CredentialModule {}
