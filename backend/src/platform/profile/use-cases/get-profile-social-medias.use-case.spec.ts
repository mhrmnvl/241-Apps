import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { ProfileRepository } from '../index.js';
import { GetProfileSocialMediasUseCase } from './get-profile-social-medias.use-case.js';

describe('GetProfileSocialMediasUseCase', () => {
  let useCase: GetProfileSocialMediasUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockSocialRepository = { findAllByProfileId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileSocialMediasUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepository },
        {
          provide: ProfileSocialMediaRepository,
          useValue: mockSocialRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProfileSocialMediasUseCase>(
      GetProfileSocialMediasUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should return social media links for a valid user', async () => {
      const mockProfile = { id: 'prof-1' };
      const mockSocialMedias = [
        { id: 'sm-1', socialMediaId: 'plt-1', username: 'ahmad_fauzi' },
      ];
      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      mockSocialRepository.findAllByProfileId.mockResolvedValue(
        mockSocialMedias,
      );

      const result = await useCase.execute(userId);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepository.findAllByProfileId).toHaveBeenCalledWith(
        'prof-1',
      );
      expect(result).toEqual(mockSocialMedias);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(mockSocialRepository.findAllByProfileId).not.toHaveBeenCalled();
    });
  });
});
