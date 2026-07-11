import { ForbiddenException } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';

/**
 * Roles de plataforma: no están atados a un colegio y ven todos los recursos.
 * Cualquier otro rol (COORDINADOR, INSTRUCTOR, APRENDIZ) queda acotado a su colegio,
 * salvo el INSTRUCTOR que además queda acotado a sus propias fichas.
 */
const PLATFORM_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.DESARROLLADOR];

export function isPlatformRole(user: User): boolean {
  return PLATFORM_ROLES.includes(user.rol);
}

/** Puede el usuario acceder a una ficha (y a lo que cuelga de ella)? */
export function canAccessFicha(
  user: User | undefined,
  ficha: { instructorId?: string | null; colegioId?: string | null },
): boolean {
  if (!user || isPlatformRole(user)) return true;
  if (user.rol === UserRole.INSTRUCTOR) return ficha.instructorId === user.id;
  return !!user.colegioId && user.colegioId === ficha.colegioId;
}

export function assertFichaAccess(
  user: User | undefined,
  ficha: { instructorId?: string | null; colegioId?: string | null },
  message = 'No tienes permisos para acceder a este recurso',
): void {
  if (!canAccessFicha(user, ficha)) {
    throw new ForbiddenException(message);
  }
}

/**
 * Agrega a un QueryBuilder la restricción de alcance del usuario sobre la ficha
 * relacionada (join ya debe existir con el alias indicado). No hace nada para
 * roles de plataforma.
 */
export function applyFichaScope<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  user: User | undefined,
  fichaAlias = 'ficha',
): void {
  // Sin usuario (ej. scripts internos de seed/migración): acceso sin restricción.
  if (!user || isPlatformRole(user)) return;

  if (user.rol === UserRole.INSTRUCTOR) {
    qb.andWhere(`${fichaAlias}.instructorId = :scopeInstructorId`, {
      scopeInstructorId: user.id,
    });
    return;
  }

  // COORDINADOR y cualquier otro rol no-plataforma: acotado a su propio colegio.
  // Si el usuario no tiene colegio asignado, no ve ninguna ficha.
  qb.andWhere(`${fichaAlias}.colegioId = :scopeColegioId`, {
    scopeColegioId: user.colegioId ?? null,
  });
}
