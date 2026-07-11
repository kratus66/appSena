import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      tokenVersion: user.tokenVersion,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fotoPerfil: user.fotoPerfil,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async validateToken(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Token emitido antes del último logout/revocación: ya no es válido
    // aunque su firma y expiración sigan siendo correctas (ver SEC-7).
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('La sesión fue cerrada, inicia sesión nuevamente');
    }

    return user;
  }

  /** Invalida todos los tokens emitidos hasta ahora para este usuario (logout real). */
  async revokeSession(userId: string): Promise<void> {
    await this.usersService.incrementTokenVersion(userId);
  }
}
