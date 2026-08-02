import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isEditable } from '../domain/admission-status.transitions.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import {
  AdmissionApplicationParentInput,
  IAdmissionApplicantRepository,
  UpdateMyApplicationFields,
} from '../domain/interfaces/admission-applicant-repository.interface.js';
import { UpdateMyApplicationDto } from '../dto/request/update-my-application.dto.js';

@Injectable()
export class UpdateMyApplicationUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
  ) {}

  async execute(userId: string, dto: UpdateMyApplicationDto) {
    const application =
      await this.admissionApplicantRepository.findMyApplication(userId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Formulir hanya dapat diubah saat status Draft atau Perlu Revisi',
      );
    }

    const { parents, birthDate, ...fields } = dto;

    const data: UpdateMyApplicationFields = {
      ...fields,
      ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
    };

    const parentInputs: AdmissionApplicationParentInput[] | undefined =
      parents?.map((p) => ({
        relation: p.relation,
        name: p.name,
        nik: p.nik ?? null,
        birthPlace: p.birthPlace ?? null,
        birthDate: p.birthDate ? new Date(p.birthDate) : null,
        phone: p.phone ?? null,
        occupationId: p.occupationId ?? null,
        educationId: p.educationId ?? null,
        income: p.income ?? null,
        isPrimary: p.isPrimary ?? false,
      }));

    const updated = await this.admissionApplicantRepository.updateMyApplication(
      {
        applicationId: application.id,
        data,
        parents: parentInputs,
      },
    );

    return serializeApplicationDetail(updated);
  }
}
