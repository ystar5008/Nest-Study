# Chapter 3 Query Builder

- SELECT, INSERT, UPDATE, DELETE, RELATIONS

## SELECT

```ts
/*
    -- SELECT
    SELECT movie.*, detail.*, director.*
    FROM movie
    LEFT JOIN detail ON detail.movieId = movie.id
    LEFT JOIN director ON director.movieId = movie.id
    WHERE movie.id = 1
    LIMIT 1
*/
const movie: Movie | null = await dataSource
  .createQueryBuilder()
  .select('movie')
  .from(Movie, 'movie')
  .leftJoinAndSelect('movie.detail', 'detail')
  .leftJoinAndSelect('movie.director', 'director')
  .where('movie.id = :id', { id: 1 })
  .getOne();
```

## INSERT

```ts
/*
    INSERT INTO movie (title, genres, directorId)
    VALUES ('New Title', '[1,2]', director.id)
*/
const result: InsertResult = await dataSource
  .createQueryBuilder()
  .insert()
  .into(Movie)
  .values([
    {
      title: 'New Title',
      genres: [1, 2],
      director,
    }
  ])
  .execute();
```

## UPDATE

```ts
/*
    UPDATE movie
    SET title = 'Updated Title', genres = '[2,3]'
    WHERE id = 1
*/
const result: UpdateResult = await dataSource
  .createQueryBuilder()
  .update(Movie)
  .set({ title: 'Updated Title', genres: [2, 3] })
  .where('id = :id', { id: 1 })
  .execute();
```

## DELETE

```ts
/*
    DELETE FROM movie WHERE id = 1
*/
const result: DeleteResult = await dataSource
  .createQueryBuilder()
  .delete()
  .from(Movie)
  .where('id = :id', { id: 1 })
  .execute();
```

## RELATIONS

```ts
/*
    SELECT genres.*
    FROM genres
    INNER JOIN movie_genres ON movie_genres.genreId = genres.id
    WHERE movie_genres.movieId = 1
*/
const genres: Genre[] = await dataSource
  .createQueryBuilder()
  .relation(Movie, 'genres')
  .of(1) // Movie id
  .loadMany();

class RelationQueryBuilder {
    getQuery(): string;
    of(): this;
    set(): void;// N:1, 1:1 관계에 사용
    add(): void;// N:M, 1:N 관계에 사용
    remove(): void;// N:M, 1:N 관계에 사용
    addAndRemove(): void;// N:M, 1:N 관계에 사용
    loadOne<T>(): T | undefined;//
    loadMany<T>(): T[];
}
```

## 기타

- getOne() / getMany()
- where() / andWhere() / orWhere()
- orderBy() / andOrderBy()
- skip() / take()
- join() / innerJoinAndSelect() / leftJoinAndSelect()

## SubQuery

```ts
(qb => { return qb.subQuery()
    .select()
    .from()
    .where()
    .getQuery();
})
```
