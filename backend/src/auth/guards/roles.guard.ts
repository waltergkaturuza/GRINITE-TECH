import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user in request');
    }

    if (!user.role) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Normalize user roles: accept string, array, or comma/space separated string
    let rawRoles: string[] = [];
    if (Array.isArray(user.role)) {
      rawRoles = user.role as string[];
    } else if (typeof user.role === 'string') {
      rawRoles = user.role
        .split(/[,:;\s]+/) // split by common delimiters
        .filter(Boolean);
    }

    const normalizedUserRoles = rawRoles.map(r => r.toLowerCase().trim());
    const normalizedRequired = requiredRoles.map(r => r.toLowerCase());

    const allowed = normalizedRequired.some(r => normalizedUserRoles.includes(r));

    if (!allowed) {
      // Attach minimal debug info (avoid leaking sensitive data)
      throw new ForbiddenException(
        `Insufficient role. Required: ${normalizedRequired.join(', ')} | User roles: ${normalizedUserRoles.join(', ')}`,
      );
    }
    return true;
  }
}