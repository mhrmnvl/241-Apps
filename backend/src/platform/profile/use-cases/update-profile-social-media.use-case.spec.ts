import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.dto.js';
import { IProfileSocialMediaRepository } from '../domain/interfaces/profile-social-media-repository.interface.js';
import { IProfileRepository } from '../index.js';
import { UpdateProfileSocialMediaUseCase } from './update-profile-social-media.use-case.js';

describe('UpdateProfileSocialMediaUseCase', () => {
  let useCase: UpdateProfileSocialMediaUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockSocialRepository = {
    findByIdAndProfile: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileSocialMediaUseCase,
        { provide: IProfileRepository, useValue: mockProfileRepository },
        {
          provide: IProfileSocialMediaRepository,
          useValue: mockSocialRepository,
        },
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

      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      mockSocialRepository.findByIdAndProfile.mockResolvedValue(mockSm);
      mockSocialRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(userId, socialMediaId, dto);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepository.findByIdAndProfile).toHaveBeenCalledWith(
        socialMediaId,
        'prof-1',
      );
      expect(mockSocialRepository.update).toHaveBeenCalledWith(
        socialMediaId,
        dto,
      );
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when social media is not found for profile', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockSocialRepository.findByIdAndProfile.mockResolvedValue(null);

      await expect(useCase.execute(userId, socialMediaId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepository.update).not.toHaveBeenCalled();
    });
  });
});
