import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { CustomerType } from '../../generated/prisma/enums.js';

export class CreateCustomerDto {
    @IsEnum(CustomerType)
    type!: CustomerType;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    businessName?: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    phone!: string;
}
