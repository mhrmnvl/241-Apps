import { PartialType } from '@nestjs/swagger';
import { CreateAnnouncementDto } from './create-announcement.dto.js';

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}
