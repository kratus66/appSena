import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health status' })
  getHealth() {
    return {
      status: 'ok',
      message: '✅ AppSena Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
