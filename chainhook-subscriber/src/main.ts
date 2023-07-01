import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from './common/transaction/common';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import validationOptions from './common/validation/validation.options';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import fs from 'fs';

async function bootstrap() {
  require('tsconfig-paths/register');

  initializeTransactionalContext(); // Initialize cls-hooked
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });

  app.useGlobalPipes(new ValidationPipe(validationOptions));

  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('Taral API')
    .setDescription('Taral API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  if (process.env.NODE_ENV === 'development') {
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  }

  SwaggerModule.setup('docs', app, document);

  const port = configService.get('app.port');

  await app.listen(port);
  console.log(`Application listening in port: ${port}`);
}
bootstrap();
