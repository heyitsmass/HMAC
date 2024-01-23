import { Injectable } from '@nestjs/common';

type TDataType = {
  data: string;
};

@Injectable()
export class AppService {
  private database = {
    data: 'Hello World!',
  } as TDataType;

  getData(): TDataType {
    return this.database;
  }

  postData({ data }: { data: string }) {
    this.database = {
      data,
    };
  }
}
