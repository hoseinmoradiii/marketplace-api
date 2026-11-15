import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  @ApiProperty({ description: 'JWT access token (10m expiry)' })
  accessToken: string;
}

export class RefreshToken {
  @ApiProperty({ description: 'JWT refresh token (30d expiry)' })
  refreshToken: string;
}

export class Tokens {
  @ApiProperty({ description: 'JWT access token (10m expiry)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (30d expiry)' })
  refreshToken: string;
}
