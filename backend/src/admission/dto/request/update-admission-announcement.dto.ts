import { PartialType } from '@nestjs/swagger';
import { CreateAdmissionAnnouncementDto } from './create-admission-announcement.dto.js';

export class UpdateAdmissionAnnouncementDto extends PartialType(
  CreateAdmissionAnnouncementDto,
) {}
