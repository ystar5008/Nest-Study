import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  private idCount = 3;

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  getManyMovies(title) {
    if (!title) {
      return this.movieRepository.find();
    }
    return this.movieRepository.find({
      where: {
        title: Like(`%${title}%`),
      },
    });
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
    });
    return movie;
  }

  async createMovie(body: CreateMovieDto) {
    const movie = await this.movieRepository.save(body);

    return movie;
  }

  async updateMovie(id, body: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: id });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }
    await this.movieRepository.update({ id }, body);

    const newMovie = await this.movieRepository.findOne({ where: id });

    return newMovie;
  }

  async deleteMovie(id) {
    const movie = await this.movieRepository.findOne({ where: id });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }

    await this.movieRepository.delete(id);

    return id;
  }
}
