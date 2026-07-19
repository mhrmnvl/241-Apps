import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'The role unique identifier',
    example: 'd3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  id!: string;

  @ApiProperty({
    description: 'The institution unique identifier',
    example: '978f8ba3-3cd2-46cc-9293-8ef2b89c8942',
  })
  institutionId!: string;

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

  @ApiProperty({ description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}
