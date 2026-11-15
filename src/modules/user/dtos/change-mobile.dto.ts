import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class ChangeMobileDto {
  @ApiProperty({ example: '+989123456789', description: 'New Iranian mobile number' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IR')
  mobile: string;
}
