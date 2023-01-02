import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function setupValidation(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}

function setupSwagger(app: INestApplication) {
  // https://docs.nestjs.com/openapi/introduction
  const config = new DocumentBuilder()
    .setTitle('Demo API Documentation')
    .setDescription('This documentation is generated by <a href="https://docs.nestjs.com/openapi/introduction" target="_blank">@nestjs/swagger</a> and <a href="https://docs.nestjs.com/openapi/cli-plugin" target="_blank">cli-plugin</a>.')
    .addServer(process.env.STAGE ? `/${process.env.STAGE}` : '')
    .setVersion('0.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
}

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  setupValidation(app)
  setupSwagger(app);
  return app;
}