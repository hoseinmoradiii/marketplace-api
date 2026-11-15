import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateFullNameDto {
  @ApiProperty({ example: 'علی رضایی', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;
}
