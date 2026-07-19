import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'The Permission ID to assign/remove for the role',
    example: 'f3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}
