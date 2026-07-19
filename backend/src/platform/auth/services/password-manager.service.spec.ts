import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PasswordManagerService } from './password-manager.service.js';

describe('PasswordManagerService', () => {
  let service: PasswordManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordManagerService],
    }).compile();

    service = module.get<PasswordManagerService>(PasswordManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      const result = await service.validatePassword('password123', hash);
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      const result = await service.validatePassword('wrongpassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'my-secure-password';
      const hash = await service.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      const match = await bcrypt.compare(password, hash);
      expect(match).toBe(true);
    });
  });
});
