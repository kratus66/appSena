import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth-cookie.util';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { access_token, user } = await this.authService.login(loginDto);

    // Cookie httpOnly: lo que usa el frontend web (no accesible desde JS, a salvo de robo por XSS).
    response.cookie(AUTH_COOKIE_NAME, access_token, getAuthCookieOptions());

    // access_token en el body: para Swagger/Postman/clientes API que usan el header Bearer.
    return { access_token, user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Invalida el token actual y cualquier otro token previamente emitido para este usuario (ver SEC-7), además de borrar la cookie.',
  })
  async logout(@GetUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.authService.revokeSession(user.id);
    response.clearCookie(AUTH_COOKIE_NAME, { ...getAuthCookieOptions(), maxAge: undefined });
    return { message: 'Sesión cerrada' };
  }
}
