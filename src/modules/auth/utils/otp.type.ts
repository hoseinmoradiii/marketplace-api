import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OtpResponse {
  @ApiProperty({ example: '+989123456789' })
  mobile: string;

  @ApiPropertyOptional({
    example: '483920',
    description: 'Only returned outside production (until SMS provider is wired)',
  })
  otp?: string;
}
