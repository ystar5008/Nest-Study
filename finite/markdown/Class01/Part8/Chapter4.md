# Chapter 4 Transaction

## Transaction의 요소

- Begin
- Commit
- Rollback

## Transaction의 문제점

- Lost Reads: 두 트랜잭션이 같은 데이터를 업데이트해서 하나의 업데이트가 손실되는 경우
- Dirty Reads: 아직 commit되지 않은 값을 다른 트랜잭션이 읽는 경우
- Non-repeatable Reads: 한 트랜잭션에서 데이터를 두번 읽을 때 다른 결과가 나오는 경우
- Phantom Reads: 첫 read 이후에 다른 트랜잭션에서 데이터를 추가한 경우

| Level \ Anomaly  | Dirty Reads | Non-Repeatable Reads | Phantom Readss |
|:----------------:|:-----------:|:-------------------:|:--------------:|
| Read Uncommitted |      o      |          o          |       o       |
| Read Committed   |      x      |          o          |       o       |
| Repeatable Read  |      x      |          x          |       o       |
| Serializable     |      x      |          x          |       x       |

```SQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION;
-- queries
COMMIT:
```
