import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { MovieModule } from './movie/movie.module';
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as joi from 'joi';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entity/genre.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entity/user.entity';
import { envVariableKeys } from './common/const/env.const';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { RBACGuard } from './auth/guard/rbac.guard';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MovieUserLike } from './movie/entity/movie-user-like.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottleInterceptor } from './common/interceptor/throttle.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonLogger, WinstonModule } from 'nest-winston';
import { ChatModule } from './chat/chat.module';
import * as winston from 'winston';
import { ChatRoom } from './chat/entity/chat-room.entity';
import { Chat } from './chat/entity/chat.entity';
import { WorkerModule } from './worker/wokrer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        ENV: joi.string().valid('dev', 'prod').required(),
        DB_TYPE: joi.string().valid('postgres').required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_DATABASE: joi.string().required(),
        HASH_ROUNDS: joi.number().required(),
        ACCESS_TOKEN_SECRET: joi.string().required(),
        REFERSH_TOKEN_SECRET: joi.string().required(),
      }),
    }),
    //config 모듈 인스턴스가 생성된 다음
    //tyeporm 모듈 임포트
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [
          Movie,
          MovieDetail,
          Director,
          Genre,
          User,
          MovieUserLike,
          Chat,
          ChatRoom,
        ],
        logging: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MovieModule,
    DirectorModule,
    GenreModule,
    AuthModule,
    UserModule,
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({
              all: true,
            }),
            winston.format.timestamp(),
            winston.format.printf(
              (info) =>
                `${info.timestamp} ${info.context}_${info.level}_${info.message}`,
            ),
          ),
        }),
        new winston.transports.File({
          dirname: join(process.cwd(), 'logs'),
          filename: 'logs.log',
          format: winston.format.combine(
            winston.format.colorize({
              all: true,
            }),
            winston.format.timestamp(),
            winston.format.printf(
              (info) =>
                `${info.timestamp} ${info.context}_${info.level}_${info.message}`,
            ),
          ),
        }),
      ],
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 0,
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/',
    }),
    ChatModule,
    ConditionalModule.registerWhen(
      WorkerModule,
      (env: NodeJS.ProcessEnv) => env['TYPE'] === 'worker',
    ),
  ],
  controllers: [],
  providers: [
    {
      // app모듈 전체에 AuthGuard적용
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: ForbiddenExceptionFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottleInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        //적용할 미들웨어
        BearerTokenMiddleware,
        //제외할 라우터
        //제외할 메서드
      )
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
      )
      //모든 라우터에 적용
      .forRoutes('*');
  }
}
