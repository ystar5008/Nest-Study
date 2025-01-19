import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  private idCount = 3;

  constructor() {
    const movie1 = new Movie();
    movie1.id = 1;
    movie1.title = '범죄도시';
    movie1.genre = '느와르';

    const movie2 = new Movie();
    movie2.id = 2;
    movie2.title = '타짜';
    movie2.genre = '느와르';

    this.movies.push(movie1, movie2);
  }

  getManyMovies(title) {
    if (!title) {
      return this.movies;
    }

    return this.movies.filter((m) => m.title.startsWith(title));
  }

  getMovieById(id: number) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }
    return movie;
  }

  createMovie(body: CreateMovieDto) {
    const { title, genre } = body;
    const movie = {
      id: this.idCount,
      title,
      genre,
    };

    this.movies.push(movie);

    return movie;
  }

  updateMovie(id, body: UpdateMovieDto) {
    const { title, genre } = body;
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }
    Object.assign(movie, { title, genre });
    return movie;
  }

  deleteMovie(id) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);

    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 ID');
    }
    this.movies.splice(movieIndex, 1);
    return id;
  }
}
