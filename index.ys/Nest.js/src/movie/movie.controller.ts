import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  ParseFloatPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Version,
  VERSION_NEUTRAL,
  Req,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { TranscationInterceptor } from 'src/common/interceptor/transaction.interceptor';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Movie } from './entity/movie.entity';
import { MovieFilePipe } from './pipe/movie-file.pipe';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/queryrunner.decorator';
import { QueryRunner as QR } from 'typeorm';
import {
  CacheKey,
  CacheTTL,
  CacheInterceptor as CI,
} from '@nestjs/cache-manager';
import { Throttle } from 'src/common/decorator/throttle.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// @Controller({
//   path: 'movie',
//   version: '2',
// })
// export class MovieControllerV2 {
//   @Get()
//   getMovies() {
//     return [];
//   }
// }

@Controller('movie')
@ApiBearerAuth()
@ApiTags('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  //로그인하지 안하도 조회 가능
  @Public()
  @Throttle({
    // 유저당 분당 5번 요청 가능
    count: 5,
    unit: 'minute',
  })
  //v5
  // @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    description: '[Movie]를 Pagination하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 API Paginations을 실행햇을때',
  })
  @ApiResponse({
    status: 400,
    description: 'Pagination데이터를 잘못입력했을떄',
  })
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId?: number) {
    return this.movieService.findAll(dto);
  }

  // 캐시데이터 반환
  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000)
  getMoviesRecent() {
    console.log('getMoviesRecent 실행');
    return this.movieService.findRecent();
  }

  // catchall
  @Get(':id')
  //로그인하지 안하도 조회 가능
  @Public()
  getMovie(@Param('id', ParseFloatPipe) id: number, @Req() request: any) {
    const session = request.session;

    const movieCount = session.movieCount ?? {};

    request.session.movieCount = {
      ...movieCount,
      [id]: movieCount[id] ? movieCount[id] + 1 : 1,
    };
    console.log(session);
    return this.movieService.findOne(id);
  }

  @Post()
  //admin 유저만 요청가능
  @RBAC(Role.admin)
  @UseInterceptors(TranscationInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(body, queryRunner, userId);
  }

  @Patch(':id')
  //admin 유저만 요청가능
  @RBAC(Role.admin)
  patchMoive(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  //admin 유저만 요청가능
  @RBAC(Role.admin)
  deleteMoive(@Param('id', ParseIntPipe) id: string) {
    return this.movieService.remove(+id);
  }

  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
