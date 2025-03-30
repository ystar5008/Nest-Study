import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/movie/entity/movie.entity';
import { DefaultLogger } from './logger/default.logger';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, cb) => {
          const split = file.originalname.split('.');

          let extesion = 'mp4';

          if (split.length > 1) {
            extesion = split[split.length - 1];
          }

          cb(null, `${v4()}_${Date.now()}.${extesion}`);
        },
      }),
    }),
    TypeOrmModule.forFeature([Movie]),
    BullModule.forRoot({
      connection: {
        host: 'redis-12409.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com',
        port: 12409,
        username: 'default',
        password: '7zmNzcU5AEvaElJNuVke8qcuSb0DvJEc',
      },
    }),
    BullModule.registerQueue({
      name: 'thumbnail-generation',
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService, DefaultLogger],
  exports: [CommonService, DefaultLogger],
})
export class CommonModule {}
