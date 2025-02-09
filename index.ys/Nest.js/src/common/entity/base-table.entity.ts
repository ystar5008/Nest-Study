import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Exclude()
export class BaseTable {
  //직렬화
  //@Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  //직렬화
  //@Expose는 명시적으로 직렬화
  // @Exclude({
  //   toClassOnly:true
  //   ,
  //   toPlainOnly:true
  // })
  updatedAt: Date;

  @VersionColumn()
  //@Exclude()
  version: number;
}
