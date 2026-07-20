import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';
import { AcceptApplicationUseCase } from './accept-application.use-case.js';
import { EnrollApplicantUseCase } from './enroll-applicant.use-case.js';
import { RejectApplicationUseCase } from './reject-application.use-case.js';
import { VerifyApplicationUseCase } from './verify-application.use-case.js';
import { VerifyDocumentUseCase } from './verify-document.use-case.js';

describe('Admission workflow use-cases', () => {
  const repo = {
    findActiveById: jest.fn(),
    findActiveWithWave: jest.fn(),
    findActiveWithDocsAndPayment: jest.fn(),
    findActiveWithParentsAndUser: jest.fn(),
    countAcceptedInWave: jest.fn(),
    findRequiredActiveDocumentTypes: jest.fn(),
    findDocument: jest.fn(),
    findStudentRoleId: jest.fn(),
    isNisTaken: jest.fn(),
    isNisnTaken: jest.fn(),
    isNikTakenInProfiles: jest.fn(),
    updateDocumentStatus: jest.fn(),
    setVerified: jest.fn(),
    setAccepted: jest.fn(),
    setRejected: jest.fn(),
    enrollAsStudent: jest.fn(),
  };
  const notifications = { notify: jest.fn() };

  let accept: AcceptApplicationUseCase;
  let reject: RejectApplicationUseCase;
  let verifyApp: VerifyApplicationUseCase;
  let verifyDoc: VerifyDocumentUseCase;
  let enroll: EnrollApplicantUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptApplicationUseCase,
        RejectApplicationUseCase,
        VerifyApplicationUseCase,
        VerifyDocumentUseCase,
        EnrollApplicantUseCase,
        { provide: IAdmissionApplicationRepository, useValue: repo },
        { provide: AdmissionNotificationService, useValue: notifications },
      ],
    }).compile();

    accept = module.get(AcceptApplicationUseCase);
    reject = module.get(RejectApplicationUseCase);
    verifyApp = module.get(VerifyApplicationUseCase);
    verifyDoc = module.get(VerifyDocumentUseCase);
    enroll = module.get(EnrollApplicantUseCase);
    jest.clearAllMocks();
  });

  describe('VerifyDocumentUseCase', () => {
    it('requires a note when rejecting a document', async () => {
      await expect(
        verifyDoc.execute('app1', 'doc1', { status: 'REJECTED' }, 'admin1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('AcceptApplicationUseCase', () => {
    it('flags a quota warning and notifies on acceptance', async () => {
      repo.findActiveWithWave.mockResolvedValue({
        id: 'app1',
        status: 'VERIFIED',
        waveId: 'w1',
        wave: { quota: 10 },
      });
      repo.countAcceptedInWave.mockResolvedValue(10);
      repo.setAccepted.mockResolvedValue({ id: 'app1', status: 'ACCEPTED' });

      const result = await accept.execute('app1', {}, 'admin1');

      expect(result.quotaWarning).toContain('Kuota gelombang');
      expect(notifications.notify).toHaveBeenCalled();
    });
  });

  describe('VerifyApplicationUseCase', () => {
    it('blocks verification when a required document is not approved', async () => {
      repo.findActiveWithDocsAndPayment.mockResolvedValue({
        id: 'app1',
        status: 'SUBMITTED',
        documents: [{ documentTypeId: 'dt1', status: 'PENDING' }],
        payment: { status: 'VERIFIED' },
      });
      repo.findRequiredActiveDocumentTypes.mockResolvedValue([
        { id: 'dt1', name: 'KK' },
      ]);

      await expect(verifyApp.execute('app1', 'admin1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('blocks verification when payment is not verified', async () => {
      repo.findActiveWithDocsAndPayment.mockResolvedValue({
        id: 'app1',
        status: 'SUBMITTED',
        documents: [{ documentTypeId: 'dt1', status: 'APPROVED' }],
        payment: { status: 'PENDING' },
      });
      repo.findRequiredActiveDocumentTypes.mockResolvedValue([
        { id: 'dt1', name: 'KK' },
      ]);

      await expect(verifyApp.execute('app1', 'admin1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('RejectApplicationUseCase', () => {
    it('rejects a submitted application and notifies', async () => {
      repo.findActiveById.mockResolvedValue({
        id: 'app1',
        status: 'SUBMITTED',
      });
      repo.setRejected.mockResolvedValue({ id: 'app1', status: 'REJECTED' });

      await reject.execute('app1', { reason: 'Berkas palsu' }, 'admin1');

      expect(repo.setRejected).toHaveBeenCalledWith({
        id: 'app1',
        adminId: 'admin1',
        reason: 'Berkas palsu',
      });
      expect(notifications.notify).toHaveBeenCalled();
    });
  });

  describe('EnrollApplicantUseCase', () => {
    const acceptedApplication = {
      id: 'app1',
      status: 'ACCEPTED',
      registrationNumber: 'REG-1',
      gender: 'MALE',
      birthPlace: 'Bandung',
      birthDate: new Date('2010-01-01'),
      nik: '123',
      parents: [],
      user: { id: 'u1' },
    };

    it('rejects enrollment when personal data is incomplete', async () => {
      repo.findActiveWithParentsAndUser.mockResolvedValue({
        ...acceptedApplication,
        birthPlace: null,
      });

      await expect(
        enroll.execute('app1', { nis: '1', nisn: '2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a NIS that is already used', async () => {
      repo.findActiveWithParentsAndUser.mockResolvedValue(acceptedApplication);
      repo.isNisTaken.mockResolvedValue(true);
      repo.isNisnTaken.mockResolvedValue(false);
      repo.isNikTakenInProfiles.mockResolvedValue(false);

      await expect(
        enroll.execute('app1', { nis: '1', nisn: '2' }),
      ).rejects.toThrow(ConflictException);
      expect(repo.enrollAsStudent).not.toHaveBeenCalled();
    });

    it('enrolls a valid accepted applicant', async () => {
      repo.findActiveWithParentsAndUser.mockResolvedValue(acceptedApplication);
      repo.isNisTaken.mockResolvedValue(false);
      repo.isNisnTaken.mockResolvedValue(false);
      repo.isNikTakenInProfiles.mockResolvedValue(false);
      repo.findStudentRoleId.mockResolvedValue('role-student');
      repo.enrollAsStudent.mockResolvedValue({
        application: { id: 'app1', status: 'ENROLLED' },
        student: { id: 's1' },
        parentsLinked: 0,
        enrollmentCreated: false,
      });

      const result = await enroll.execute('app1', { nis: '1', nisn: '2' });

      expect(repo.enrollAsStudent).toHaveBeenCalledWith(
        acceptedApplication,
        { nis: '1', nisn: '2' },
        'role-student',
      );
      expect(notifications.notify).toHaveBeenCalled();
      expect(result.student.id).toBe('s1');
    });
  });
});
