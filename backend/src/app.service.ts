import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'App SENA API - Backend para instructores ACTUALIZADOs ✅';
  }
}
