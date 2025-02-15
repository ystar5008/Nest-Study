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
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { MovieTitleValidationPipe } from './pipe/movie.-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  //로그인하지 안하도 조회 가능
  @Public()
  getMovies(@Query() dto: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Get(':id')
  //로그인하지 안하도 조회 가능
  @Public()
  getMovie(@Param('id', ParseFloatPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Post()
  //admin 유저만 요청가능
  @RBAC(Role.admin)
  postMoive(@Body() body: CreateMovieDto) {
    return this.movieService.create(body);
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
}
