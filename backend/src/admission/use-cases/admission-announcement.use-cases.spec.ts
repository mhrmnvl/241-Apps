import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { GetAdmissionAnnouncementsUseCase } from './get-admission-announcements.use-case.js';
import { CreateAdmissionAnnouncementUseCase } from './create-admission-announcement.use-case.js';
import { UpdateAdmissionAnnouncementUseCase } from './update-admission-announcement.use-case.js';
import { PublishAdmissionAnnouncementUseCase } from './publish-admission-announcement.use-case.js';
import { DeleteAdmissionAnnouncementUseCase } from './delete-admission-announcement.use-case.js';

describe('Admission Announcement use-cases', () => {
  const mockRepository = {
    findAll: jest.fn(),
    findActiveById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    softDelete: jest.fn(),
    notifyScope: jest.fn(),
  };

  let getAll: GetAdmissionAnnouncementsUseCase;
  let create: CreateAdmissionAnnouncementUseCase;
  let update: UpdateAdmissionAnnouncementUseCase;
  let publish: PublishAdmissionAnnouncementUseCase;
  let remove: DeleteAdmissionAnnouncementUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdmissionAnnouncementsUseCase,
        CreateAdmissionAnnouncementUseCase,
        UpdateAdmissionAnnouncementUseCase,
        PublishAdmissionAnnouncementUseCase,
        DeleteAdmissionAnnouncementUseCase,
        { provide: IAdmissionAnnouncementRepository, useValue: mockRepository },
      ],
    }).compile();

    getAll = module.get(GetAdmissionAnnouncementsUseCase);
    create = module.get(CreateAdmissionAnnouncementUseCase);
    update = module.get(UpdateAdmissionAnnouncementUseCase);
    publish = module.get(PublishAdmissionAnnouncementUseCase);
    remove = module.get(DeleteAdmissionAnnouncementUseCase);
    jest.clearAllMocks();
  });

  describe('GetAdmissionAnnouncementsUseCase', () => {
    it('wraps repository result with pagination meta', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [{ id: 'a1' }],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await getAll.execute({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('CreateAdmissionAnnouncementUseCase', () => {
    it('stamps publishedAt when created as published', async () => {
      mockRepository.create.mockResolvedValue({ id: 'a1' });

      await create.execute(
        { title: 'T', content: 'C', isPublished: true },
        'admin-1',
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'T',
          waveId: null,
          isPublished: true,
          createdById: 'admin-1',
          publishedAt: expect.any(Date),
        }),
      );
    });

    it('leaves publishedAt null for a draft', async () => {
      mockRepository.create.mockResolvedValue({ id: 'a1' });

      await create.execute({ title: 'T', content: 'C' }, 'admin-1');

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isPublished: false, publishedAt: null }),
      );
    });
  });

  describe('UpdateAdmissionAnnouncementUseCase', () => {
    it('throws NotFoundException when the announcement is missing', async () => {
      mockRepository.findActiveById.mockResolvedValue(null);
      await expect(update.execute('x', { title: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PublishAdmissionAnnouncementUseCase', () => {
    it('publishes then fans out notifications to the wave scope', async () => {
      mockRepository.findActiveById.mockResolvedValue({
        id: 'a1',
        waveId: 'w1',
        title: 'Hasil',
        content: 'Isi',
        isPublished: false,
      });
      mockRepository.publish.mockResolvedValue({ id: 'a1', isPublished: true });

      await publish.execute('a1');

      expect(mockRepository.publish).toHaveBeenCalledWith('a1');
      expect(mockRepository.notifyScope).toHaveBeenCalledWith(
        'w1',
        'Hasil',
        'Isi',
      );
    });
  });

  describe('DeleteAdmissionAnnouncementUseCase', () => {
    it('soft-deletes an existing announcement', async () => {
      mockRepository.findActiveById.mockResolvedValue({ id: 'a1' });
      mockRepository.softDelete.mockResolvedValue({ id: 'a1' });

      await remove.execute('a1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('a1');
    });
  });
});
