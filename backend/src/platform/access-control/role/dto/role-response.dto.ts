import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from '../../permissions/dto/permission-response.dto.js';

export class RoleResponseDto {
  @ApiProperty({
    description: 'The role unique identifier',
    example: 'd3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  id!: string;

  @ApiProperty({ description: 'The name of the role', example: 'Teacher' })
  name!: string;

  @ApiProperty({ description: 'The code of the role', example: 'TEACHER' })
  code!: string;

  @ApiProperty({
    description: 'The description of the role',
    example: 'Institution Teacher role',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Whether the role is a system reserved role',
    example: false,
  })
  isSystem!: boolean;

  @ApiProperty({
    description: 'Permissions granted to this role',
    type: [PermissionResponseDto],
  })
  permissions!: PermissionResponseDto[];

  @ApiProperty({ description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}
