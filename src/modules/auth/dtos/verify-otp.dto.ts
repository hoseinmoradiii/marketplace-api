import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IR')
  mobile: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  submittedOtp: string;
}
