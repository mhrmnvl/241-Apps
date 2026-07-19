import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordManagerService {
  async validatePassword(
    plaintext: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plaintext, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
