import { Test, TestingModule } from '@nestjs/testing';
import { CreateSocialMediaDto } from '../dto/request/create-social-media.dto.js';
import { SocialMediaQueryDto } from '../dto/request/social-media-query.dto.js';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';
import { CreateSocialMediaUseCase } from '../use-cases/create-social-media.use-case.js';
import { DeleteSocialMediaUseCase } from '../use-cases/delete-social-media.use-case.js';
import { GetSocialMediaByIdUseCase } from '../use-cases/get-social-media-by-id.use-case.js';
import { GetSocialMediasUseCase } from '../use-cases/get-social-medias.use-case.js';
import { UpdateSocialMediaUseCase } from '../use-cases/update-social-media.use-case.js';
import { SocialMediaController } from './social-media.controller.js';

describe('SocialMediaController', () => {
  let controller: SocialMediaController;

  const mockGetPlatformsService = { execute: jest.fn() };
  const mockGetPlatformByIdService = { execute: jest.fn() };
  const mockCreatePlatformService = { execute: jest.fn() };
  const mockUpdatePlatformService = { execute: jest.fn() };
  const mockDeletePlatformService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediaController],
      providers: [
        { provide: GetSocialMediasUseCase, useValue: mockGetPlatformsService },
        {
          provide: GetSocialMediaByIdUseCase,
          useValue: mockGetPlatformByIdService,
        },
        {
          provide: CreateSocialMediaUseCase,
          useValue: mockCreatePlatformService,
        },
        {
          provide: UpdateSocialMediaUseCase,
          useValue: mockUpdatePlatformService,
        },
        {
          provide: DeleteSocialMediaUseCase,
          useValue: mockDeletePlatformService,
        },
      ],
    }).compile();

    controller = module.get<SocialMediaController>(SocialMediaController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetSocialMediasUseCase with query', async () => {
      const query: SocialMediaQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'plt-1', name: 'Instagram' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetPlatformsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetPlatformsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetSocialMediaByIdUseCase with id', async () => {
      const id = 'plt-1';
      const expected = { id: 'plt-1', name: 'Instagram' };
      mockGetPlatformByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetPlatformByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateSocialMediaUseCase with dto', async () => {
      const dto: CreateSocialMediaDto = {
        name: 'TikTok',
        baseUrl: 'https://tiktok.com/',
      };
      const expected = {
        id: 'plt-new',
        name: 'TikTok',
        baseUrl: 'https://tiktok.com/',
      };
      mockCreatePlatformService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreatePlatformService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateSocialMediaUseCase with id and dto', async () => {
      const id = 'plt-1';
      const dto: UpdateSocialMediaDto = { name: 'Instagram Rebranded' };
      const expected = { id: 'plt-1', name: 'Instagram Rebranded' };
      mockUpdatePlatformService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdatePlatformService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteSocialMediaUseCase with id', async () => {
      const id = 'plt-1';
      mockDeletePlatformService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeletePlatformService.execute).toHaveBeenCalledWith(id);
    });
  });
});
