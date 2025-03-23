Part 8

#### Colunm 옵션

- 첫번째 파라미터에 객체로 제공

```
type : ColumType // varcahr ,text ,int ,bool 등 컬럼 타입
name : string // 데이터베이스에 저장될 칼럼이름
nullable : boolean // Null 값이 가능한지 여부 default false
update : boolean // 업데이트 가능여부 false일 경우 저장후 업데이트 불가 default ture
select : boolean // 쿼리시행시 프로터피를 가져올 ㅣ결정 , false 일경우 가져오지 않음.
default : string // 컬럼 기본값
unique : boolean // unique constraint 적용여부 기본 false
oomment : string // 칼럼 코멘트
enum : string[] // 칼럼에 입력가능한 값을 enum으로 나열
array: boolean
```
