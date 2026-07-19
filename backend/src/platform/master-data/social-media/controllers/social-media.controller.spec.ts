import { Test, TestingModule } from '@nestjs/testing';
import { CreateSocialMediaDto } from '../dto/create-social-media.dto.js';
import { SocialMediaQueryDto } from '../dto/social-media-query.dto.js';
import { UpdateSocialMediaDto } from '../dto/update-social-media.dto.js';
import { CreateSocialMediaService } from '../services/create-social-media.service.js';
import { DeleteSocialMediaService } from '../services/delete-social-media.service.js';
import { GetSocialMediaByIdService } from '../services/get-social-media-by-id.service.js';
import { GetSocialMediasService } from '../services/get-social-medias.service.js';
import { UpdateSocialMediaService } from '../services/update-social-media.service.js';
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
        { provide: GetSocialMediasService, useValue: mockGetPlatformsService },
        {
          provide: GetSocialMediaByIdService,
          useValue: mockGetPlatformByIdService,
        },
        {
          provide: CreateSocialMediaService,
          useValue: mockCreatePlatformService,
        },
        {
          provide: UpdateSocialMediaService,
          useValue: mockUpdatePlatformService,
        },
        {
          provide: DeleteSocialMediaService,
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
    it('should delegate to GetSocialMediasService with query', async () => {
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
    it('should delegate to GetSocialMediaByIdService with id', async () => {
      const id = 'plt-1';
      const expected = { id: 'plt-1', name: 'Instagram' };
      mockGetPlatformByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetPlatformByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateSocialMediaService with dto', async () => {
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
    it('should delegate to UpdateSocialMediaService with id and dto', async () => {
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
    it('should delegate to DeleteSocialMediaService with id', async () => {
      const id = 'plt-1';
      mockDeletePlatformService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeletePlatformService.execute).toHaveBeenCalledWith(id);
    });
  });
});
