import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { GetAdmissionWavesUseCase } from './get-admission-waves.use-case.js';
import { GetAdmissionWaveByIdUseCase } from './get-admission-wave-by-id.use-case.js';
import { CreateAdmissionWaveUseCase } from './create-admission-wave.use-case.js';
import { UpdateAdmissionWaveUseCase } from './update-admission-wave.use-case.js';
import { DeleteAdmissionWaveUseCase } from './delete-admission-wave.use-case.js';

describe('Admission Wave use-cases', () => {
  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  let getWaves: GetAdmissionWavesUseCase;
  let getById: GetAdmissionWaveByIdUseCase;
  let create: CreateAdmissionWaveUseCase;
  let update: UpdateAdmissionWaveUseCase;
  let remove: DeleteAdmissionWaveUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdmissionWavesUseCase,
        GetAdmissionWaveByIdUseCase,
        CreateAdmissionWaveUseCase,
        UpdateAdmissionWaveUseCase,
        DeleteAdmissionWaveUseCase,
        { provide: IAdmissionWaveRepository, useValue: mockRepository },
      ],
    }).compile();

    getWaves = module.get(GetAdmissionWavesUseCase);
    getById = module.get(GetAdmissionWaveByIdUseCase);
    create = module.get(CreateAdmissionWaveUseCase);
    update = module.get(UpdateAdmissionWaveUseCase);
    remove = module.get(DeleteAdmissionWaveUseCase);
    jest.clearAllMocks();
  });

  const createDto = {
    name: 'Gelombang 1',
    code: 'G1-2026',
    academicYearId: 'ay-1',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    quota: 100,
    registrationFee: 250000,
  };

  describe('GetAdmissionWavesUseCase', () => {
    it('returns paginated data with computed meta and serialized fee', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [
          { id: 'w1', registrationFee: 250000, _count: { applications: 0 } },
        ],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await getWaves.execute({ page: 1, limit: 10 });

      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(result.data[0].registrationFee).toBe(250000);
    });
  });

  describe('GetAdmissionWaveByIdUseCase', () => {
    it('throws NotFoundException when missing', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(getById.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('CreateAdmissionWaveUseCase', () => {
    it('creates when code is free', async () => {
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'w1',
        registrationFee: 250000,
      });

      const result = await create.execute(createDto);

      expect(mockRepository.findByCode).toHaveBeenCalledWith('G1-2026');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'G1-2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-02-01'),
          isActive: true,
        }),
      );
      expect(result.registrationFee).toBe(250000);
    });

    it('throws ConflictException when code already used', async () => {
      mockRepository.findByCode.mockResolvedValue({ id: 'existing' });
      await expect(create.execute(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('UpdateAdmissionWaveUseCase', () => {
    it('rejects a code that collides with another wave', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'w1', code: 'G1-2026' });
      mockRepository.findByCode.mockResolvedValue({ id: 'other' });

      await expect(update.execute('w1', { code: 'G2-2026' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('DeleteAdmissionWaveUseCase', () => {
    it('blocks deletion when the wave still has applications', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'w1',
        _count: { applications: 3 },
      });

      await expect(remove.execute('w1')).rejects.toThrow(ConflictException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
