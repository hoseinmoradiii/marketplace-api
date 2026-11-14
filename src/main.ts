import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from './common/logger/logger.service.js';
import { CatchAllErrorsFilter } from './common/filters/all-exception.filter.js';
import { SwaggerConfig } from './configs/swagger.config.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new CatchAllErrorsFilter());
  app.use(helmet());
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('PORT');

  SwaggerConfig.forRoot(app);

  const logger = app.get(Logger);

  await app.listen(PORT, () => {
    logger.log(
      `application is running on http://localhost:${PORT}`,
      'Bootstrap',
    );
    logger.log(
      `swagger is running on http://localhost:${PORT}/swagger`,
      'Bootstrap',
    );
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed:', error);
  process.exit(1);
});
