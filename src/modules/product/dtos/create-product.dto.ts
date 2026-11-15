import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 13', maxLength: 150 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'Excellent condition, barely used' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '50000000', description: 'Price in IRR (digits only)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'price must contain digits only' })
  @MaxLength(14)
  price: string;
}
