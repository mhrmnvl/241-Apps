import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'admin01' })
  identifier!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: UserInfoDto })
  user!: UserInfoDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
