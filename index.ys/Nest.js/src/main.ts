import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffmpegFluent from 'fluent-ffmpeg';
import * as ffprobe from 'ffprobe-static';
import * as session from 'express-session';

ffmpegFluent.setFfmpegPath(ffmpeg.path);
ffmpegFluent.setFfprobePath(ffprobe.path);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  // app.enableVersioning({
  //   //type: VersioningType.HEADER,
  //   type: VersioningType.MEDIA_TYPE,
  //   key: 'v=',
  // });
  //클래스 validator 적용

  const config = new DocumentBuilder()
    .setTitle('스웨거 제목')
    .setDescription('스웨거 설명')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 로그인 안한 사람들의 정보를 저장
  app.use(
    session({
      secret: 'secret',
    }),
  );
  await app.listen(process.env.PORT, () =>
    console.log(`Server is running on port ${process.env.PORT}`),
  );
}
bootstrap();
