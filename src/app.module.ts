import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormConfig } from './configs/typeorm.config.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    TypeormConfig.forRoot(),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
