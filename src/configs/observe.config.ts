import { ConfigModule, ConfigService } from '@nestjs/config';
import { ObserveModule } from '../modules/observe.module.js';

export class ObserveConfig {
  static forRoot() {
    return ObserveModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        appKey: configService.getOrThrow<string>('OBSERVE_APP_KEY'),
        appSecret: configService.getOrThrow<string>('OBSERVE_APP_SECRET'),
        serviceId: configService.getOrThrow<string>('APPLICATION_ID'),

        enabled: configService.get<string>('NODE_ENV') === 'production',
      }),
    });
  }
}
