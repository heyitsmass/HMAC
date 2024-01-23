import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getData() {
    return this.appService.getData();
  }

  @Post('/')
  @Header('Content-Type', 'application/json')
  postData(@Body() data: { data: string }) {
    return this.appService.postData(data);
  }
}
