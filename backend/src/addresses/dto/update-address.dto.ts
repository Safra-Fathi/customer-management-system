import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { AddressType } from '../../generated/prisma/enums.js';

export class UpdateAddressDto {
    @IsOptional()
    @IsEnum(AddressType)
    type?: AddressType;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    addressLine1?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    addressLine2?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    state?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    postalCode?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;
}