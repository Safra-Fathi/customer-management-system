import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getProfile(@Req() request: AuthenticatedRequest) {
        return {
            user: request.user,
        };
    }
}