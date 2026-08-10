import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import type { PresenceSubjectTypeEnum } from '../../domain/entities/credential.entity.js';

export class IssueCredentialDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The person the card belongs to',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ['STUDENT', 'EMPLOYEE'] })
  @IsIn(['STUDENT', 'EMPLOYEE'])
  subjectType!: PresenceSubjectTypeEnum;
}
