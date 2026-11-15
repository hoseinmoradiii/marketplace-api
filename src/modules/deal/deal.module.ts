import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity.js';
import { ProductEntity } from './entities/product.entity.js';
import { OfferEntity } from './entities/offer.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, OfferEntity])],
})
export class DealModule {}
