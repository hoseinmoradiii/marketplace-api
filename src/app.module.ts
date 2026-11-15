import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormConfig } from './configs/typeorm.config.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { OfferModule } from './modules/offer/offer.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    RedisModule,
    TypeormConfig.forRoot(),
    UserModule,
    AuthModule,
    ProductModule,
    OfferModule,
  ],
})
export class AppModule {}
