import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+989123456789', description: 'Iranian mobile number' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IR')
  mobile: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP sent to the mobile' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  submittedOtp: string;
}
