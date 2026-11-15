import { ApiProperty } from '@nestjs/swagger';

export class OtpResponse {
  @ApiProperty({ example: '+989123456789' })
  mobile: string;

  @ApiProperty({ example: '483920' })
  otp: string;
}
