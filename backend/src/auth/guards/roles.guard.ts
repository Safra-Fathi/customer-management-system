import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../generated/prisma/enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';

interface RequestWithUser {
    user?: JwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request =
            context.switchToHttp().getRequest<RequestWithUser>();

        const user = request.user;

        if (!user) {
            throw new ForbiddenException(
                'User information is unavailable',
            );
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'You do not have permission to perform this action',
            );
        }

        return true;
    }
}