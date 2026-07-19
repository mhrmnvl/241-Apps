import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSocialMediaDto } from '../dto/create-social-media.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';
import { CreateSocialMediaUseCase } from './create-social-media.use-case.js';

describe('CreateSocialMediaUseCase', () => {
  let useCase: CreateSocialMediaUseCase;

  const mockRepo = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSocialMediaUseCase,
        { provide: ISocialMediaRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateSocialMediaUseCase>(CreateSocialMediaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateSocialMediaDto = {
      name: 'Instagram',
      baseUrl: 'https://instagram.com/',
    };
    const mockPlatform = {
      id: 'plt-1',
      name: 'Instagram',
      baseUrl: 'https://instagram.com/',
    };

    it('should create a platform successfully', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockPlatform);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith(dto.name);
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPlatform);
    });

    it('should throw ConflictException when platform name already exists', async () => {
      mockRepo.findByName.mockResolvedValue({ id: 'plt-existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
