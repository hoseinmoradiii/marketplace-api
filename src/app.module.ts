import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObserveConfig } from './configs/observe.config.js';
import { TypeormConfig } from './configs/typeorm.config.js';
import { LoggerModule } from './common/logger/logger.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveConfig.forRoot(),
    LoggerModule,
    TypeormConfig.forRoot(),
  ],
})
export class AppModule {}
