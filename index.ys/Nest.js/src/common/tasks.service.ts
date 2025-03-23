import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import { Movie } from 'src/movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DefaultLogger } from './logger/default.logger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TasksService {
  // private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
    // private readonly logger: DefaultLogger,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // @Cron('*/5 * * * * *')
  logEverySecond() {
    this.logger.fatal('fatal');
    this.logger.error('error');
    this.logger.warn('warn');
    // 정보성 로그 info레벨
    this.logger.log('1초마다');
    // 개발환경에서 디버그
    this.logger.debug('디버그');
    this.logger.verbose('verbose', TasksService.name);
  }

  //@Cron('* * * * * *')
  async eraseOrphanFile() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));
    console.log(files);

    const deleteFilesTargets = files.filter((file) => {
      const filename = parse(file).name; // 확장자를 제외한 이름

      const split = filename.split('_');

      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(split[split.length - 1]);
        const aDayInMMilSec = 24 * 60 * 60 * 1000;

        const now = +new Date();

        return now - date > aDayInMMilSec;
      } catch (e) {
        return true;
      }
    });

    await Promise.all(
      deleteFilesTargets.map((x) => {
        unlink(join(process.cwd(), 'public', 'temp', x));
      }),
    );
  }

  // @Cron('0 * * * * *')
  async calculatecount() {
    console.log('rr');
    await this.movieRepository.query(`
        UPDATE movie m 
        SET "likeCount" = (SELECT count(*) FROM movie_user_like mul
        WHERE m.id = mul."movieId" AND mul."isLike" = true
        )
        `);

    await this.movieRepository.query(`
            UPDATE movie m 
            SET "dislikeCount" = (SELECT count(*) FROM movie_user_like mul
            WHERE m.id = mul."movieId" AND mul."isLike" = false
            )
        `);
  }

  //   @Cron('* * * * * *', {
  //     name: 'printer',
  //   })
  printer() {
    console.log('1초');
  }

  //   @Cron('*/5 * * * * *')
  stopper() {
    console.log('멈처');

    const job = this.schedulerRegistry.getCronJob('printer');

    console.log('#last date');
    // 마지막 실행시간
    console.log(job.lastDate());
    console.log('#next date');
    // 다음실행 시간
    console.log(job.lastDate());
    console.log(job.nextDates(5));

    if (job.running) {
      job.stop();
    } else {
      job.start();
    }
    job.stop();
  }
}
