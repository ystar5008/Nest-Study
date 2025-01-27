# Chapter 2 TypeORM 기본기

## ORM(Object-Relational Mapping)

- 종류: TypeORM, Prisma, Drizzle, Sequelize

## TypeORM의 특징

- DB 테이블을 클래스로 관리
- 여러 DB 지원
- Active Record / Data Mapper 패턴 모두 지원
  - Active Record 패턴:
    - Model로써 DB에 접근
    - 모델 자체에 query 메서드를 상속받아 사용
  - Data Mapper 패턴
    - 리포지터리로써 DB에 접근
    - Data Access Layer
- Migration 지원, 점진적 DB 구조 변경과 버저닝 지원
- Eager & Lazy 로딩 지원

## DataSource

```ts
const PostgresDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  schema: 'public'
  entities: [ /* 여기에 적은 entity가 DB의 테이블로 생성된다 */ ],
  synchronize: true,
  logging: true
});
```

## Entity

대상 클래스에 Entity를 달아줘서 테이블로써 관리할 수 있게 한다

```ts
function Entity(options? EntityOptions): ClassDecorator

interface EntityOptions {
  name?: string;                // DB에 생성될 table 이름
  orderBy?: OrderByCondition;   // { title: "ASC", detail: { order: "DESC", nulls: "NULLS LAST" }}
  schema?: string;              // postgres database 안에서의 논리적 schema
  comment?: string;             // table에 대한 주석
}
```

### PrimaryGeneratedColumn

```ts
function PrimaryGeneratedColumn(strategy?: Strategy, options?: PrimaryGeneratedColumnNumericOptions): PropertyDecorator

type Strategy = 'increment' | 'uuid' | 'rowid' | 'identity';

interface PrimaryGeneratedColumnNumericOptions {
  type?: PrimaryGeneratedColumnType;    // PK로 사용가능한 postgres에서의 자료형
  name?: string;                        // table에 생성될 column의 이름
  comment?: string;                     // column에 대한 주석
  primaryKeyConstraintsName?: string;   //생성될 PK contraint의 이름
}
```

- increment(default)
  - `id SERIAL PRIMARY KEY`
  - 1부터 자동 증가
- uuid

  - `id UUID PRIMARY KEY`
  - ex. 123e4567-e89b-12d3-a456-426614174000

- rowid
  - SQLite 전용

- identity(권장)
  - `id BIGINT GENERATE ALWAYS AS IDENTITY PRIMARY KEY`
  - PostgreSQL 10 이상에서 지원

## Column

```ts
function @Column(options?: ColumnOptions): PropertyDecorator

interface ColumnOptions extends ColumnCommonOptions {
  type?: ColumnType;
  name?: string;
  length?: string | number;                             // string 같은 타입에 대한 길이 ex. VARCHAR(100)
  nullable?: number;                                    // default: false
  readonly?: boolean;                                   // NOTE - Deprecated: update와 반대이므로 update 사용할 것
  update?: boolean;                                     // save에 의해 업데이트 될 수 있는지 여부, false면 최초 insert 시에만 write 가능(default: true)
  select?: boolean;                                     // QueryBuilder와 find에 의해 select되는지의 여부(default: true), TODO: @Exclude와 비교해보기
  insert?: boolean;                                     // column이 디폴트로 삽입되는지의 여부(default: true)
  default?: any;                                        // column의 디폴트값
  primary?: boolean;                                    // @PrimaryColumn()과 동일
  unique?: boolean;                                     // column의 unique 여부
  comment?: string;
  precision?: number | null;                            // decimal column에 대한 precision
  scale?: number;                                       // decimal column에 대한 scale
  charset?: string;
  enum?: (string | number)[] | Object;                  // enum의 값 목록
  enumName?: string;
  primaryKeyConstraintsName?: string;
  foreignKeyConstraintsName?: string;
  generatedIdentity?: 'ALWAYS' | 'BY DEFAULT';
  hstoreType?: 'object' | 'string';
  /**
   * Indicates if this column is an array.
   * ? Can be simply set to true or array length can be specified.
   * Supported only by postgres.
   */
  array?: boolean;                                      // 배열 여부
  transformer?: ValueTransformer | ValueTransformer[];  // repository <-> DB 간 변환
  spatialFeatureType?: string;                          // postgres의 지리 데이터 관련 기능
}
```

### ValueTransformer

```ts
@Column({
transformer: {
    to: (value) => value.toLowerCase(),
    from: (value) => value.toUpperCase(),
  }
})
name: string
```

### 기타

```ts
@CreateDateColumn / @UpdateDateColumn / @DeleteDateColumn
@VersionColumn
@BeforeInsert / @AfterInsert
@BeforeUpdate / @AfterUpdate
@BeforeRemove / @AfterRemove
@AfterLoad
```

## 05. Repository CRUD 작업 이론

### Create

- create()
  - DB에 insert**할**객체를 생성한다
  - entity에 builder나 constructor가 없기 때문에 존재한다
    - [builder-pattern](https://www.npmjs.com/package/builder-pattern) 사용법
  - `Repository<Entity>`의 제네릭에 명시한 타입의 객체를 리턴한다

- save()
  - PK가 이미 존재한다면 업데이트한다
    - INSERT 전에 PK 확인을 하기 때문에 insert()보다 속도가 느리다
  - PK없을 시: `START TRANSACTION -> INSERT -> COMMIT`
  - PK있을 시: `SELECT -> START TRANSACTION -> UPDATE -> COMMIT`
  - Entity 여러개를 한번에 저장 가능하다

```ts
interface SaveOptions {
  chunk?: number;         // save를 chunk수만큼 나눠서 수행
  transaction?: boolean;  // 쿼리에 START TRANSACTION, COMMIT 제거
}
```

- `{ chunk: 100, transaction: false }`
  - chunk[1]가 insert 실패한다고 가정하면
    - chunk[0]: 정상 insert
    - chunk[1]: Error 발생
    - chunk[2:]: insert 시행자체가 안됨

- insert()
  - PK가 이미 있을 시 에러 발생
  - InsertResult를 리턴한다
    - `INSERT INTO TABLE( ... ) VALUES( ... ) RETURNING ...`
  - Entity 여러개를 한번에 저장 가능하다

```ts
// return 예시
{
    "identifiers": [ { "id": 10, "nationalNo": 27 } ],
    "generatedMaps": [ { "id": 10, "version": 1, "createdAt": "2025-01-25T11:48:04.741Z", } ],
    "raw": [ { "id": 10, "version": 1, "createdAt": "2025-01-25T11:48:04.741Z", } ]
}
```

### Update

- upsert()
  - save()와는 다르게 일단 insert 시도하고 UQ 충돌하면 update를 시도한다

```SQL
INSERT INTO some_table
VALUES (UQColumn1, ... UQColumn2 ...)
ON CONFLICT (UQColumn1, UQColumn)
DO UPDATE SET ...
RETURNING ...
```

```ts
  interface UpsertOptions {
    // ! 복합 UQ 조건은 ClassDecorator에 추가해야 된다 ex. @Unique(['title', 'genres'])
    conflictPaths: string[] | { [P in keyof Entity]?: true } // ex. ['title', 'genres'] | { title: true, genres: true }
    skipUpdateIfNovaluesChanged?: boolean;                   // 쿼리가 수행되긴 한다 (default: false)
  }

```

- update()
  - UpdateResult를 리턴한다
  - criteria: 첫번째 인자로 PK나 FindOptionsWhere
  - PartialEntity: 업데이트할 내용

### Find

- find()
  - 조회 결과가 없으면 빈 배열 반환

```ts
  interface FindManyOptions extends FindOptions {
    skip?: number;
    take: number;
  }

  interface FindOneOptions {
    comment?: string;// 쿼리 앞에 주석을 달아준다(디버그에 유용)
    select?: FindOptionsSelect | FindOptionsSelectByString;// select할 컬럼
    where?: FindOptionsWhere[] | FindOptionsWhere;
    relations?: FindOptionsRelations | FindOptionsRelationByString;
    relationLoadStrategy?: 'join' | 'query'; //
    order?: FindOptionsOrder;
    cache?: boolean | number | { id: any; milliseconds: number; };
    withDeleted?: boolean;
    loadRelationIds?
    loadEagerRelations?: boolean;
    transaction?: boolean;
  }
```

- findOne()
  - SELECT FROM some_table `LIMIT 1`
  - 조회 결과가 없으면 null 반환

- findAndCount()
  - returns `[Entity[] | number]`

- exists(): boolean

- preload()
  - 인자로 전달한 EntityLike의 PK로 조회하고 EntityLike의 프로퍼티를 덮어쓴 결과를 반환

  ```ts
  movieDto = {
    id: 1;
    title: 'Inception'
  }
  const movie = repo.preload(movieDto);

  const movie = repo.findOneById(movieDto.id);
  Object.assign(movie, movieDto)
  ```

### Delete

- delete()
  - 보통 PK 기준으로 삭제, 배열도 전달 가능
  - or findOptionsWhere로 상세조건 지정
  - returns DeleteResult
  - PK 존재 여부를 확인하지 않고 빠르다
  - 삭제할 Record가 없어도 Error 발생 x
  - Unlike save method executes a primitive operation without cascades, relations and other operations included.
  - cascade 적용 x

- softDelete()
  - `UPDATE some_table SET deletedAt = CURRENT_TIMESTAMP, version = version + 1, updatedAt = CURRENT_TIMESTAMP WHERE id IN ($1)`

- remove()
  - `START TRANSACTION -> DELETE -> COMMIT`
  - 인자로 삭제할 Entity 자체를 받는다
  - returns the deleted Entity

- softRemove()
  - `START TRANSACTION -> UPDATE -> COMMIT`

- restore()
  - `UPDATE some_table SET deletedAt = NULL, version = version + 1, updatedAt = CURRENT_TIMESTAMP WHERE id IN ($1)`

- recover()
  - `START TRANSACTION -> UPDATE -> COMMIT`
  - returns the recovered Entity

### Statistics

- count()
- sum()
- average()
- minimum()
- maximum()

### ETC

- query()
- clear()

## Typeorm의 Find Operator

- Equal() / Not()
- LessThan & LessThanOrEqual
- MoreThan & MoreThanOrEqual
- Between
- Like & ILike(case-Insensitive Like)
- In([])
- ArrayContains([]): <@: 쿼리의 배열을 target의 배열이 포함하고 있으면(배열의 요소가 많을수록 count 감소)
- ArrayContainedBy([]): @>: 쿼리의 배열이 target의 배열을 포함하고 있으면(배열의 요소가 많을수록 count 증가)
- ArrayOverlap([]): &&: 쿼리의 배열과 target의 배열에 교집합이 있으면
- IsNull()
- Or() / And()
- Raw()

## Entity Embedding

- 클래스는 따로 두지만 테이블은 하나로 생성된다
- 임베딩되는 클래스는 @Entity를 붙이지 않는다
- 임베딩하는 클래스는 `@Column(() => EmbeddedClass) EmbeddingProperty`

## Entity Inheritance

- 부모는 abstract 선언하고 @Entity를 붙이지 않는다
- 자식 클래스에서 상속받는다

## Single Table Inheritance

- 부모에 @Entity를 붙인다
- 부모에 `@TableInheritance({ column: { type: 'varchar', name: 'type' }})`를 붙인다
- 자식에 @ChildEntity를 붙이고 상속받는다
-> type이라는 컬럼 이름으로 상속받은 자식들이 구분된다
- 자식 클래스의 프로퍼티들은 nullable이다

## Relationship

### OneToOne

- @JoinColumn을 명시한 프로퍼티의 테이블에 FK 컬럼이 생성된다

### ManyToOne / OneToMany

- Many쪽에 FK 컬럼이 생성된다
- 중간테이블이 생성된다
- referencedColumnName 옵션으로 FK를 지정할 수 있다

```ts
function JoinColumn(options: JoinColumnOptions): PropertyDecorator

interface JoinColumnOptions {
  name?: string;
  referencedColumnName?: string;    // 기본값은 상대 테이블의 id 프로퍼티지만 원하는 프로퍼티를 지정할 수 있게 해준다
  foreignKeyContraintName?: string; // FK의 이름 지정
}

// ex. RefClass.id 대신 RefClass.refCol이 FK가 된다
@JoinColumn({ referencedColumnName: 'refCol' }) refClass: RefClass
```

### ManyToMany

```ts
function JoinTable(options: JoinTableOptions): PropertyDecorator

interface JoinTableOptions {
  name?: string;
  joinColumn?: JoinColumnOptions;
  inverseJoinColumn?: JoinColumnOptions;
}
```

### Relation Options

```ts
  interface RelationOptions {
    cascade?: boolean | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[]; // 부모 엔티티의 작업이 자식 엔티티의 작업에도 전파
    nullable?: boolean;
    onDelete?: OnDeleteType;// DB레벨의 ON DELETE
    onUpdate?: OnUpdateType;// DB레벨의 ON UPDATE
    deferrable?: DeferrableType; // 'INITIALLY IMMEDIATE' | 'INITIALLY DEFERRED'
    createForeignKeyConstraints?: boolean; // default: true
    lazy?: boolean;
    eager?: boolean;
    persistence?: boolean;
    orphanedRowAction?: 'nullify' | 'delete' | 'soft-delete' | 'disable'; // Entity레벨에서 ON DELETE/UPDATE와 동일, 둘 중 하나만 쓸 것
  }

  type OnDeleteType = OnUpdateType = 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'DEFAULT' | 'NO ACTION';

```
