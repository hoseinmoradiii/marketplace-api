import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '55000000', description: 'Offer amount, must be >= product price' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'amount must contain digits only' })
  amount: string;
}
