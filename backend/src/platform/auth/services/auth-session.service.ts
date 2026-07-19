import { Injectable } from '@nestjs/common';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';

@Injectable()
export class AuthSessionService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async findUserSessions(userId: string) {
    return this.authRepository.findUserSessions(userId);
  }

  async findById(id: string) {
    return this.authRepository.findSessionWithUser(id);
  }

  async revoke(id: string) {
    return this.authRepository.revokeSession(id);
  }

  async revokeAll(userId: string) {
    return this.authRepository.revokeAll(userId);
  }
}
