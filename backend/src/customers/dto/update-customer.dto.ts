import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import {
    CustomerStatus,
    CustomerType,
} from '../../generated/prisma/enums.js';

export class UpdateCustomerDto {
    @IsOptional()
    @IsEnum(CustomerType)
    type?: CustomerType;

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

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @IsOptional()
    @IsEnum(CustomerStatus)
    status?: CustomerStatus;
}