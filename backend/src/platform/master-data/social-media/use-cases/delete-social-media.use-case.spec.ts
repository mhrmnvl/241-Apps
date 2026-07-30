import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SchoolUnitSocialMediaRepository } from '../../../school-unit/index.js';
import { ProfileSocialMediaRepository } from '../../../profile/index.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';
import { DeleteSocialMediaUseCase } from './delete-social-media.use-case.js';

describe('DeleteSocialMediaUseCase', () => {
  let useCase: DeleteSocialMediaUseCase;

  const mockRepo = {
    findById: jest.fn(),
    remove: jest.fn(),
  };

  const mockSchoolUnitSocialMediaRepository = {
    countByPlatformId: jest.fn(),
  };

  const mockProfileSocialMediaRepository = {
    countByPlatformId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSocialMediaUseCase,
        { provide: ISocialMediaRepository, useValue: mockRepo },
        {
          provide: SchoolUnitSocialMediaRepository,
          useValue: mockSchoolUnitSocialMediaRepository,
        },
        {
          provide: ProfileSocialMediaRepository,
          useValue: mockProfileSocialMediaRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteSocialMediaUseCase>(DeleteSocialMediaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'plt-1';

    it('should delete a platform successfully when not in use', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'plt-1', name: 'Instagram' });
      mockSchoolUnitSocialMediaRepository.countByPlatformId.mockResolvedValue(
        0,
      );
      mockProfileSocialMediaRepository.countByPlatformId.mockResolvedValue(0);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(
        mockSchoolUnitSocialMediaRepository.countByPlatformId,
      ).toHaveBeenCalledWith(id);
      expect(
        mockProfileSocialMediaRepository.countByPlatformId,
      ).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when platform is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockSchoolUnitSocialMediaRepository.countByPlatformId.mockResolvedValue(
        0,
      );
      mockProfileSocialMediaRepository.countByPlatformId.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when platform is used by school units', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'plt-1', name: 'Instagram' });
      mockSchoolUnitSocialMediaRepository.countByPlatformId.mockResolvedValue(
        2,
      );
      mockProfileSocialMediaRepository.countByPlatformId.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when platform is used by profiles', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'plt-1', name: 'Instagram' });
      mockSchoolUnitSocialMediaRepository.countByPlatformId.mockResolvedValue(
        0,
      );
      mockProfileSocialMediaRepository.countByPlatformId.mockResolvedValue(5);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when platform is used by both school units and profiles', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'plt-1', name: 'Instagram' });
      mockSchoolUnitSocialMediaRepository.countByPlatformId.mockResolvedValue(
        1,
      );
      mockProfileSocialMediaRepository.countByPlatformId.mockResolvedValue(3);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
