import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferEntity } from './entities/offer.entity.js';
import { OfferRepository } from './repositories/offer.repository.js';
import { OfferService } from './services/offer.service.js';
import { OfferController } from './offer.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ProductModule } from '../product/product.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferEntity]),
    AuthModule,
    ProductModule,
  ],
  controllers: [OfferController],
  providers: [OfferRepository, OfferService],
  exports: [OfferRepository, OfferService],
})
export class OfferModule {}
