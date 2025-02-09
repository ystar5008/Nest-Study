import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  private idCount = 3;

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(title?) {
    const qb = await this.movieDetailRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return qb.getManyAndCount();
    // if (!title) {
    //   return [
    //     this.movieRepository.find({
    //       relations: ['director', 'genres'],
    //     }),
    //     await this.movieDetailRepository.count(),
    //   ];
    // }
    // return this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`),
    //   },
    //   relations: ['director', 'genres'],
    // });
  }

  async findOne(id: number) {
    const movie = await this.movieDetailRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id = :id', { id })
      .getOne();

    // const movie = await this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['detail', 'director', 'genres'],
    // });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화');
    }
    return movie;
  }

  async create(body: CreateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const director = await qr.manager.findOne(Director, {
        where: { id: body.directorId },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID');
      }

      const genres = await qr.manager.find(Genre, {
        where: { id: In(body.genreIds) },
      });

      if (genres.length !== body.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있음 ${genres.map((genre) => genre.id).join(',')}`,
        );
      }

      const movieDetail = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({
          detail: body.detail,
        })
        .execute();

      const movieDetailId = movieDetail.identifiers[0].id;

      const movie = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: body.title,
          detail: {
            id: movieDetailId,
          },
          director,
        })
        .execute();

      const movieId = movie.identifiers[0].id;

      await qr.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map((genre) => genre.id));

      // const movie = await this.movieRepository.save({
      //   title: body.title,
      //   detail: {
      //     detail: body.detail,
      //   },
      //   director,
      //   genres,
      // });

      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();

      throw e;
    } finally {
      //db 커넥션 풀 반환
      await qr.release();
    }
  }

  async update(id, body: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    qr.connect();
    qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID');
      }

      const { detail, directorId, genreIds, ...movieRest } = body;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Genre, {
          where: {
            id: directorId,
          },
        });

        if (!directorId) {
          throw new NotFoundException('존재하지 않는 ID');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: {
            id: In(genreIds),
          },
        });

        if (genres.length !== body.genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 장르가 있음 ${genres.map((genre) => genre.id).join(',')}`,
          );
        }

        newGenres = genres;
      }

      /**
       * {
       * ...movieRest,
       * director: director
       * }
       */
      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await qr.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id = :id', { id })
        .execute();

      // await this.movieRepository.update(
      //   {
      //     id,
      //   },
      //   movieUpdateFields,
      // );

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({
            detail,
          })
          .where('id = :id', { id: movie.detail.id })
          .execute();

        await this.movieDetailRepository.update(
          {
            id: movie.detail.id,
          },
          {
            detail,
          },
        );
      }

      if (newGenres) {
        await qr.manager
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          // [새로 추가할 장르 아이디] 추가 , [이미 존재하는 장르] 삭제
          .addAndRemove(
            newGenres.map((genre) => genre.id),
            movie.genres.map((genre) => genre.id),
          );
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: { id },
      //   relations: ['details', 'director'],
      // });

      // newMovie.genres = newGenres;

      // await this.movieRepository.save(newMovie);

      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genre'],
      });
    } catch (e) {
      qr.rollbackTransaction();
      throw e;
    } finally {
      qr.release();
    }
  }

  async remove(id) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }
    await this.movieRepository
      .createQueryBuilder()
      .delete()
      .where('id =:id', { id })
      .execute();

    //await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
