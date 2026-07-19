import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The User ID to assign/remove role for',
    example: '9a9e3ee8-4a56-4c74-a029-798dfb0a3909',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
