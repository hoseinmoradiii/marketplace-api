import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../modules/user/entities/user.entity.js';

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
        entities: [UserEntity],
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') === 'development'
            ? true
            : false,
      }),
    });
  }
}
