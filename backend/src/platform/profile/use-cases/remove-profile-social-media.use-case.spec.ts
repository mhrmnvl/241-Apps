import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { ProfileRepository } from '../index.js';
import { RemoveProfileSocialMediaUseCase } from './remove-profile-social-media.use-case.js';

describe('RemoveProfileSocialMediaUseCase', () => {
  let useCase: RemoveProfileSocialMediaUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockSocialRepo = {
    findByIdAndProfile: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProfileSocialMediaUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileSocialMediaRepository, useValue: mockSocialRepo },
      ],
    }).compile();

    useCase = module.get<RemoveProfileSocialMediaUseCase>(
      RemoveProfileSocialMediaUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const socialMediaId = 'sm-1';

    it('should remove social media successfully', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepo.findByIdAndProfile.mockResolvedValue({ id: 'sm-1' });
      mockSocialRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(userId, socialMediaId);

      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepo.findByIdAndProfile).toHaveBeenCalledWith(
        socialMediaId,
        'prof-1',
      );
      expect(mockSocialRepo.remove).toHaveBeenCalledWith(socialMediaId);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when social media is not found for profile', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepo.findByIdAndProfile.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepo.remove).not.toHaveBeenCalled();
    });
  });
});
