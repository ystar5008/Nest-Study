import { Exclude, Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { BaseTable } from './base-table.entity';
import { MovieDetail } from './movie-detail.entity';

// ManyToOne 감독은 여러개의 영화 감독 : 영화 = 1:N
// OneToOne 영화는 1개의 상세 내용  영화 : 내용 = 1:1
// ManyToMany 영화는 여러개의 장르 영화 : 장르 N:M

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
  // 값 변경
  @Column()
  genre: string;

  @OneToOne(() => MovieDetail)
  @JoinColumn() // movie가 moviedetail을 가지고 있음
  detail: MovieDetail;
}
