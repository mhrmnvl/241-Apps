import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IProfileSocialMediaRepository } from '../domain/interfaces/profile-social-media-repository.interface.js';
import { IProfileRepository } from '../index.js';
import { RemoveProfileSocialMediaUseCase } from './remove-profile-social-media.use-case.js';

describe('RemoveProfileSocialMediaUseCase', () => {
  let useCase: RemoveProfileSocialMediaUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockSocialRepository = {
    findByIdAndProfile: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProfileSocialMediaUseCase,
        { provide: IProfileRepository, useValue: mockProfileRepository },
        {
          provide: IProfileSocialMediaRepository,
          useValue: mockSocialRepository,
        },
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
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepository.findByIdAndProfile.mockResolvedValue({ id: 'sm-1' });
      mockSocialRepository.remove.mockResolvedValue(undefined);

      await useCase.execute(userId, socialMediaId);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepository.findByIdAndProfile).toHaveBeenCalledWith(
        socialMediaId,
        'prof-1',
      );
      expect(mockSocialRepository.remove).toHaveBeenCalledWith(socialMediaId);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when social media is not found for profile', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepository.findByIdAndProfile.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepository.remove).not.toHaveBeenCalled();
    });
  });
});
