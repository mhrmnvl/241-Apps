import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';
import { GetSocialMediaByIdService } from './get-social-media-by-id.service.js';

describe('GetSocialMediaByIdService', () => {
  let useCase: GetSocialMediaByIdService;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSocialMediaByIdService,
        { provide: ISocialMediaRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetSocialMediaByIdService>(GetSocialMediaByIdService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'plt-1';

    it('should return a platform when found', async () => {
      const mockPlatform = { id: 'plt-1', name: 'Instagram' };
      mockRepo.findById.mockResolvedValue(mockPlatform);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPlatform);
    });

    it('should throw NotFoundException when platform is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
