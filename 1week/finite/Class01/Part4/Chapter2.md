# Chapter 2 컨트롤러

## 03. Movie API 설계하기

### GET

- /movie
  - `getMovies()`
  - 전체 영화 정보 조회

- /movie/:id
  - `getMovie(id: number)`
  - id에 대한 영화 정보 조회

### POST

- `/movie`
  - 영화 정보 생성
  - 생성된 영화 정보를 반환

### PUT

- `/movie/:id`
  - (구현 X) id에 대한 영화 정보를 전체 업데이트

### PATCH

- `/movie/:id`
  - id에 대한 영화 정보를 부분 업데이트
  - 업데이트된 영화의 전체 정보를 반환

### DELETE

- `/movie/:id`
  - id에 대한 영화 정보를 삭제
  - (일반적으로) 삭제된 id를 반환

### 프로젝트 시작

```bash
# $ nest new|n [options] [name] [path]
# Options:
#   -s, --skip-install
#   -p, --package-manager
#   --strict
$ nest n -p pnpm -s --strict netflix
$ cd netflix && pnpm i
$ pnpm start:dev
```

## 04. Movie API Path 구현하기

### 요청 핸들러

  ```ts
  // 배열로 여러개의 path를 전달 가능
  @Get(['movie', 'movies'])

  // @RequestMapping으로도 사용 가능
  @RequestMapping({ path: 'movie', method: RequestMethod.GET })

  // HEAD를 제외한 모든 요청에 응답
  // 엔드포인트의 소스코드 상 위치에 따라 우선순위가 바뀐다
  @All()
  // payload가 있는 리소스 조회 메서드(cf. Query)
  @Search()

  // 클래스 레벨에 사용 시 일괄 path를 적용된다
  @Controller('movie')
  @Controller(['movie', 'movies'])
  ```

#### Path Variables

- path variables는 무조건 문자열로 인식된다
- 엔드포인트의 소스코드 상 위치에 따라 우선순위가 바뀐다

```ts
// 가령 /movie/actor/?name=tom-cruise 요청에 대해
// 아래의 경우엔 의도대로 findActor()가 실행되지만
@Get('movie') findAll() {}
@Get('movie/actor') findActor(@Query() params) { /* 이 메서드가 실행된다 */ }
@Get('movie/:id') find() { /* 아래에 있으므로 실행되지 않는다 */ }

// 여기서는 find()가 먼저 가로채버린다
@Get('movie') findAll() {}
@Get('movie/:id') find() { /* 이 메서드가 실행된다 */ }
@Get('movie/actor') findActor(@Query() params) { /* 아래에 있으므로 실행되지 않는다 */ }
```

### 요청 데이터 파싱

```ts
// Path Variable
// GET /movie/123
@Param() path: { id: string } // -> { id: 123 }
@Param('id') id: string // -> 123

// POST /movie
@Body() body: CreateMovieDto // -> { ... }
@Body('title') title: string // -> 'Inception'

// GET /movie?title=Inception
@Query() param: Record<string, string> // -> { ... }
@Query('title') title: string // -> 'Inception'

// Headers(복수형임에 주의; 단수형은 별도로 존재)
// ALL /movie
@Headers() headers: Record<string, string> // -> { ... }
@Headers('accept-encoding') acceptEncoding: string // -> 'gzip, deflate, br'
```
