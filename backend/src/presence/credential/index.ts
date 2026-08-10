export {
  ICredentialRepository,
  type CredentialQueryInput,
  type CredentialResolution,
  type CredentialWithCode,
  type CredentialWithHolder,
} from './domain/interfaces/credential-repository.interface.js';
export type {
  CredentialEntity,
  CredentialStatusEnum,
  PresenceSubjectTypeEnum,
} from './domain/entities/credential.entity.js';
export {
  CredentialResponseDto,
  CredentialWithCodeResponseDto,
} from './dto/response/credential-response.dto.js';
