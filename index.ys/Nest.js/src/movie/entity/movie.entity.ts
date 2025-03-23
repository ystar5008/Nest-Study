import { Exclude, Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { MovieFilePipe } from '../pipe/movie-file.pipe';
import { User } from 'src/user/entity/user.entity';
import { join } from 'path';
import { MovieUserLike } from './movie-user-like.entity';

// ManyToOne 감독은 여러개의 영화 감독 : 영화 = 1:N
// OneToOne 영화는 1개의 상세 내용  영화 : 내용 = 1:1
// ManyToMany 영화는 여러개의 장르 영화 : 장르 N:M

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.createMovies)
  creator: User;

  @Column({
    unique: true,
  })
  title: string;
  // 값 변경

  @ManyToMany(() => Genre, (genre) => genre.movies)
  genres: Genre[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn() // movie가 moviedetail을 가지고 있음
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;

  @Column()
  @Transform(({ value }) => {
    // 파일경로 db저장
    `http://localhost:3000/movie/${value}`;
  })
  movieFileName: string;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: MovieUserLike[];
}
