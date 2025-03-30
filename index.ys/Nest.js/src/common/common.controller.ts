import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { CommonService } from './common.service';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('common')
@ApiBearerAuth()
@ApiTags('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @InjectQueue('thumbnail-generation')
    private readonly thumbnailQueue: Queue,
  ) {}

  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      // 파일 제약사항
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        console.log(file);

        if (file.mimetype !== 'video/mp4') {
          return callback(new BadRequestException('비디오만'), false);
        }
        return callback(null, true);
      },
    }),
  )
  async createVideo(
    @UploadedFile()
    movie: Express.Multer.File,
  ) {
    await this.thumbnailQueue.add(
      'thumbnail',
      {
        videoId: movie.filename,
        videoPath: movie.path,
      },
      {
        priority: 1,
        delay: 100,
        attempts: 3,
        // 스택으로
        lifo: true,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return {
      fileName: movie.filename,
    };
  }
}
