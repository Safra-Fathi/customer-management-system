import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserStatus } from '../generated/prisma/enums.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const data = await this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: [{ createdAt: 'desc' }],
    });
    return { data };
  }

  async create(dto: CreateUserDto) {
    const name = dto.name.trim();
    const email = dto.email.trim().toLowerCase();

    if (name.length < 2) {
      throw new BadRequestException('Name must contain at least 2 characters');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      return await this.prisma.user.create({
        data: { name, email, passwordHash, role: dto.role, status: dto.status },
        select: publicUserSelect,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, actorId: string) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (id === actorId && dto.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: publicUserSelect,
    });
  }
}
