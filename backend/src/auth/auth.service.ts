import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const email = loginDto.email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await argon2.verify(
            user.passwordHash,
            loginDto.password,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}