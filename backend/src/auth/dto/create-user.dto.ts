import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    UserRole,
    UserStatus,
} from '../../generated/prisma/enums.js';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @MaxLength(255)
    email!: string;

    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password!: string;

    @IsEnum(UserRole)
    role!: UserRole;

    @IsEnum(UserStatus)
    status!: UserStatus;
}