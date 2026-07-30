import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileSocialMediaDto } from '../dto/request/create-profile-social-media.dto.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { ProfileRepository } from '../index.js';
import { AddProfileSocialMediaUseCase } from './add-profile-social-media.use-case.js';

describe('AddProfileSocialMediaUseCase', () => {
  let useCase: AddProfileSocialMediaUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockSocialRepository = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProfileSocialMediaUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepository },
        {
          provide: ProfileSocialMediaRepository,
          useValue: mockSocialRepository,
        },
      ],
    }).compile();

    useCase = module.get<AddProfileSocialMediaUseCase>(
      AddProfileSocialMediaUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const dto: CreateProfileSocialMediaDto = {
      socialMediaId: 'plt-1',
      username: 'ahmad_fauzi',
    };

    it('should add social media successfully', async () => {
      const mockProfile = { id: 'prof-1' };
      const mockSm = { id: 'sm-new', ...dto };

      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      mockSocialRepository.create.mockResolvedValue(mockSm);

      const result = await useCase.execute(userId, dto);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockSocialRepository.create).toHaveBeenCalledWith('prof-1', dto);
      expect(result).toEqual(mockSm);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSocialRepository.create).not.toHaveBeenCalled();
    });
  });
});
