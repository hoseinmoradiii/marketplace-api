import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../modules/user/entities/user.entity.js';
import { ProductEntity } from '../modules/product/entities/product.entity.js';
import { OfferEntity } from '../modules/offer/entities/offer.entity.js';
import { OutboxEntity } from '../common/entities/outbox.entity.js';

export class TypeormConfig {
  static forRoot() {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        database: configService.getOrThrow<string>('DB_NAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        entities: [UserEntity, ProductEntity, OfferEntity, OutboxEntity],
        autoLoadEntities: true,
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') === 'development'
            ? true
            : false,
      }),
    });
  }
}
