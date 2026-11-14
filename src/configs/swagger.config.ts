import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SecuritySchemeObject,
  SwaggerModule,
} from '@nestjs/swagger';

export class SwaggerConfig {
  static forRoot(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('True Offers API')
      .setDescription(
        [
          'REST API for the **True Offers** marketplace platform.',
          '',
          '### Authentication',
          'Protected endpoints require a **JWT Bearer token** in the `Authorization` header.',
        ].join('\n'),
      )
      .setVersion('v0.0.1')
      .addBearerAuth(this.swaggerAuthConfig(), 'jwt')
      .addSecurityRequirements('jwt')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/swagger', app, document);
  }

  private static swaggerAuthConfig = (): SecuritySchemeObject => ({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });
}
