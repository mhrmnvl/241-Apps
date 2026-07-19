import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'The permission unique identifier',
    example: 'f3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  id!: string;

  @ApiProperty({
    description: 'The module category of the permission',
    example: 'students',
  })
  module!: string;

  @ApiProperty({ description: 'The action permitted', example: 'create' })
  action!: string;

  @ApiProperty({
    description: 'The code of the permission',
    example: 'students.create',
  })
  code!: string;

  @ApiProperty({
    description: 'The description of the permission',
    example: 'Allow creating student profile',
    required: false,
  })
  description?: string | null;
}
