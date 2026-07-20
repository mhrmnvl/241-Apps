import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';
import { PasswordManagerService } from '../../platform/auth/services/password-manager.service.js';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case.js';
import { RegisterApplicantUseCase } from './register-applicant.use-case.js';
import { SubmitApplicationUseCase } from './submit-application.use-case.js';
import { UpdateMyApplicationUseCase } from './update-my-application.use-case.js';

describe('Admission applicant use-cases', () => {
  const repo = {
    findOpenWave: jest.fn(),
    findActiveUserByIdentifier: jest.fn(),
    findApplicantRoleId: jest.fn(),
    registerApplicant: jest.fn(),
    findMyApplication: jest.fn(),
    findMyDetail: jest.fn(),
    findRequiredActiveDocumentTypes: jest.fn(),
    updateMyApplication: jest.fn(),
    submitApplication: jest.fn(),
    findMyNotification: jest.fn(),
    markNotificationRead: jest.fn(),
    markAllNotificationsRead: jest.fn(),
  };
  const passwordManager = { hashPassword: jest.fn() };
  const notifications = { notify: jest.fn() };

  let register: RegisterApplicantUseCase;
  let updateMine: UpdateMyApplicationUseCase;
  let submit: SubmitApplicationUseCase;
  let markRead: MarkNotificationReadUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterApplicantUseCase,
        UpdateMyApplicationUseCase,
        SubmitApplicationUseCase,
        MarkNotificationReadUseCase,
        { provide: IAdmissionApplicantRepository, useValue: repo },
        { provide: PasswordManagerService, useValue: passwordManager },
        { provide: AdmissionNotificationService, useValue: notifications },
      ],
    }).compile();

    register = module.get(RegisterApplicantUseCase);
    updateMine = module.get(UpdateMyApplicationUseCase);
    submit = module.get(SubmitApplicationUseCase);
    markRead = module.get(MarkNotificationReadUseCase);
    jest.clearAllMocks();
  });

  const registerDto = {
    fullName: 'Budi',
    email: 'Budi@Mail.com',
    password: 'secret12',
    passwordConfirm: 'secret12',
    waveId: 'w1',
  };

  describe('RegisterApplicantUseCase', () => {
    it('rejects mismatched password confirmation', async () => {
      await expect(
        register.execute({ ...registerDto, passwordConfirm: 'nope' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a closed / missing wave', async () => {
      repo.findOpenWave.mockResolvedValue(null);
      await expect(register.execute(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects an already-registered email', async () => {
      repo.findOpenWave.mockResolvedValue({ id: 'w1', code: 'G1' });
      repo.findActiveUserByIdentifier.mockResolvedValue({ id: 'u1' });
      await expect(register.execute(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('fails when the APPLICANT role is missing', async () => {
      repo.findOpenWave.mockResolvedValue({ id: 'w1', code: 'G1' });
      repo.findActiveUserByIdentifier.mockResolvedValue(null);
      repo.findApplicantRoleId.mockResolvedValue(null);
      await expect(register.execute(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('registers and returns the lower-cased identifier', async () => {
      repo.findOpenWave.mockResolvedValue({ id: 'w1', code: 'G1' });
      repo.findActiveUserByIdentifier.mockResolvedValue(null);
      repo.findApplicantRoleId.mockResolvedValue('role-applicant');
      passwordManager.hashPassword.mockResolvedValue('hashed');
      repo.registerApplicant.mockResolvedValue({
        id: 'app1',
        registrationNumber: 'G1-0001',
      });

      const result = await register.execute(registerDto);

      expect(result).toEqual({
        id: 'app1',
        registrationNumber: 'G1-0001',
        identifier: 'budi@mail.com',
      });
    });
  });

  describe('UpdateMyApplicationUseCase', () => {
    it('throws NotFound when the applicant has no application', async () => {
      repo.findMyApplication.mockResolvedValue(null);
      await expect(updateMine.execute('u1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('blocks edits once the application is locked', async () => {
      repo.findMyApplication.mockResolvedValue({
        id: 'app1',
        status: 'SUBMITTED',
      });
      await expect(updateMine.execute('u1', {})).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('SubmitApplicationUseCase', () => {
    it('lists missing requirements before allowing submission', async () => {
      repo.findMyDetail.mockResolvedValue({
        id: 'app1',
        status: 'DRAFT',
        wave: { endDate: new Date('2999-01-01') },
        parents: [],
        documents: [],
        payment: null,
      });
      repo.findRequiredActiveDocumentTypes.mockResolvedValue([]);

      await expect(submit.execute('u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('MarkNotificationReadUseCase', () => {
    it('throws NotFound for a notification the applicant does not own', async () => {
      repo.findMyNotification.mockResolvedValue(null);
      await expect(markRead.executeOne('u1', 'n1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('marks all as read', async () => {
      const result = await markRead.executeAll('u1');
      expect(repo.markAllNotificationsRead).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ success: true });
    });
  });
});
