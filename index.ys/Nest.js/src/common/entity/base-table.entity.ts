import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Exclude()
export class BaseTable {
  //직렬화
  @Exclude()
  @CreateDateColumn()
  @ApiHideProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiHideProperty()
  //직렬화
  //@Expose는 명시적으로 직렬화
  @Exclude({
    toClassOnly: true,
    toPlainOnly: true,
  })
  updatedAt: Date;

  @VersionColumn()
  @ApiHideProperty()
  //@Exclude()
  version: number;
}
