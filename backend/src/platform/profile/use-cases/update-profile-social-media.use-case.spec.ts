import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.dto.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { ProfileRepository } from '../index.js';
import { UpdateProfileSocialMediaUseCase } from './update-profile-social-media.use-case.js';

describe('UpdateProfileSocialMediaUseCase', () => {
  let useCase: UpdateProfileSocialMediaUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockSocialRepo = {
    findByIdAndProfile: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileSocialMediaUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileSocialMediaRepository, useValue: mockSocialRepo },
      ],
    }).compile();

    useCase = module.get<UpdateProfileSocialMediaUseCase>(
      UpdateProfileSocialMediaUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const socialMediaId = 'sm-1';
    const dto: UpdateProfileSocialMediaDto = {
      username: 'ahmad_new',
    };

    it('should update social media successfully', async () => {
      const mockProfile = { id: 'prof-1' };
      const mockSm = { id: 'sm-1', socialMediaId: 'plt-1' };
      const updated = { ...mockSm, ...dto };

      mockProfileRepo.findByUserId.mockResolvedValue(mockProfile);
      mockSocialRepo.findByIdAndProfile.mockResolvedValue(mockSm);
      mockSocialRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(userId, socialMediaId, dto);

      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepo.findByIdAndProfile).toHaveBeenCalledWith(
        socialMediaId,
        'prof-1',
      );
      expect(mockSocialRepo.update).toHaveBeenCalledWith(socialMediaId, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when social media is not found for profile', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepo.findByIdAndProfile.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepo.update).not.toHaveBeenCalled();
    });
  });
});
