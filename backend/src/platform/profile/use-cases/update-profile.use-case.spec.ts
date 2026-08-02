import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';
import { UpdateProfileDto } from '../dto/request/update-profile.dto.js';
import { IProfileRepository } from '../domain/interfaces/profile-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { UpdateProfileUseCase } from './update-profile.use-case.js';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;

  const mockRepo = {
    findByUserId: jest.fn(),
    findByNik: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    update: jest.fn(),
  };
  const mockStorage = {
    getSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        { provide: IProfileRepository, useValue: mockRepo },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const currentProfile = { id: 'prof-1', userId: 'user-1' };

    it('should update profile successfully (no unique field changes)', async () => {
      const dto: UpdateProfileDto = {
        name: 'Ahmad Updated',
        gender: UserGender.MALE,
        birthDate: '2000-01-01',
      };
      const updated = { ...currentProfile, ...dto };

      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(userId, dto);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockRepo.findByNik).not.toHaveBeenCalled();
      expect(mockRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockRepo.findByPhone).not.toHaveBeenCalled();
      // The port takes a real Date; the use case converts the ISO string.
      expect(mockRepo.update).toHaveBeenCalledWith(userId, {
        ...dto,
        birthDate: new Date(dto.birthDate!),
      });
      expect(result).toEqual({ ...updated, avatar: null });
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, { name: 'Ahmad' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate NIK', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.findByNik.mockResolvedValue({ id: 'prof-other' });

      await expect(
        useCase.execute(userId, { nik: '3578010101080099' }),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.findByNik.mockResolvedValue(null);
      mockRepo.findByEmail.mockResolvedValue({ id: 'prof-other' });

      await expect(
        useCase.execute(userId, {
          nik: '3578010101080001',
          email: 'dup@email.com',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate phone', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.findByPhone.mockResolvedValue({ id: 'prof-other' });

      await expect(
        useCase.execute(userId, { phone: '081234567899' }),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT check NIK when nik is absent from dto', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.update.mockResolvedValue(currentProfile);

      await useCase.execute(userId, { name: 'Test' });

      expect(mockRepo.findByNik).not.toHaveBeenCalled();
    });

    it('should NOT check email when email is absent from dto', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.update.mockResolvedValue(currentProfile);

      await useCase.execute(userId, { name: 'Test' });

      expect(mockRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should NOT check phone when phone is absent from dto', async () => {
      mockRepo.findByUserId.mockResolvedValue(currentProfile);
      mockRepo.update.mockResolvedValue(currentProfile);

      await useCase.execute(userId, { name: 'Test' });

      expect(mockRepo.findByPhone).not.toHaveBeenCalled();
    });
  });
});
