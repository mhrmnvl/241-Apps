import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateSocialMediaDto } from '../dto/update-social-media.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';
import { UpdateSocialMediaService } from './update-social-media.service.js';

describe('UpdateSocialMediaService', () => {
  let useCase: UpdateSocialMediaService;

  const mockRepo = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSocialMediaService,
        { provide: ISocialMediaRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateSocialMediaService>(UpdateSocialMediaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'plt-1';
    const currentPlatform = { id: 'plt-1', name: 'Instagram' };

    it('should update a platform successfully (no name change)', async () => {
      const dto: UpdateSocialMediaDto = {};
      const updated = { ...currentPlatform };

      mockRepo.findById.mockResolvedValue(currentPlatform);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByName).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should check name uniqueness when name changes', async () => {
      const dto: UpdateSocialMediaDto = { name: 'Facebook' };

      mockRepo.findById.mockResolvedValue(currentPlatform);
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue({
        ...currentPlatform,
        name: 'Facebook',
      });

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith('Facebook', id);
    });

    it('should throw NotFoundException when platform is not found', async () => {
      const dto: UpdateSocialMediaDto = { name: 'Facebook' };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is already taken', async () => {
      const dto: UpdateSocialMediaDto = { name: 'Facebook' };

      mockRepo.findById.mockResolvedValue(currentPlatform);
      mockRepo.findByName.mockResolvedValue({ id: 'plt-other' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT call findByName when name is absent from dto', async () => {
      const dto: UpdateSocialMediaDto = {};

      mockRepo.findById.mockResolvedValue(currentPlatform);
      mockRepo.update.mockResolvedValue(currentPlatform);

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).not.toHaveBeenCalled();
    });
  });
});
