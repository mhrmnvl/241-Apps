import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTeacherDto } from '../dto/request/update-teacher.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { UpdateTeacherUseCase } from './update-teacher.use-case.js';

describe('UpdateTeacherUseCase', () => {
  let useCase: UpdateTeacherUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByNip: jest.fn(),
    findByNuptk: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTeacherUseCase,
        { provide: TeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateTeacherUseCase>(UpdateTeacherUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'emp-1';
    const currentTeacher = {
      id: 'emp-1',
      user: { id: 'u-1' },
      nip: '198006152005011001',
      employmentTypeId: 'emp-type-uuid',
    };

    it('should update an teacher successfully', async () => {
      const dto: UpdateTeacherDto = {
        employmentTypeId: 'emp-type-uuid-2',
      };
      const updatedTeacher = {
        ...currentTeacher,
        employmentTypeId: 'emp-type-uuid-2',
      };

      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.update.mockResolvedValue(updatedTeacher);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updatedTeacher);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      const dto: UpdateTeacherDto = {
        employmentTypeId: 'emp-type-uuid-2',
      };
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new NIP is already registered', async () => {
      const dto: UpdateTeacherDto = { nip: '199001012020011002' };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.findByNip.mockResolvedValue({ id: 'other-emp' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new NUPTK is already registered', async () => {
      const dto: UpdateTeacherDto = { nuptk: '9999888877776666' };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.findByNuptk.mockResolvedValue({ id: 'other-emp' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should NOT check NIP uniqueness when nip is not in dto', async () => {
      const dto: UpdateTeacherDto = {
        employmentTypeId: 'emp-type-uuid-2',
      };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.update.mockResolvedValue(currentTeacher);

      await useCase.execute(id, dto);

      expect(mockRepository.findByNip).not.toHaveBeenCalled();
    });

    it('should NOT check NUPTK uniqueness when nuptk is not in dto', async () => {
      const dto: UpdateTeacherDto = {
        employmentTypeId: 'emp-type-uuid-2',
      };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.update.mockResolvedValue(currentTeacher);

      await useCase.execute(id, dto);

      expect(mockRepository.findByNuptk).not.toHaveBeenCalled();
    });
  });
});
