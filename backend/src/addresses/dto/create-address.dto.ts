import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { AddressType } from '../../generated/prisma/enums.js';

export class CreateAddressDto {
    @IsEnum(AddressType)
    type!: AddressType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    addressLine1!: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    addressLine2?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    state?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    country!: string;
}