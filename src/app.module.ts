import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormConfig } from './configs/typeorm.config.js';
import { LoggerModule } from './common/logger/logger.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    TypeormConfig.forRoot(),
  ],
})
export class AppModule {}
