import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import {
    CustomerStatus,
    CustomerType,
} from '../../generated/prisma/enums.js';

export enum CustomerSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    EMAIL = 'email',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class CustomerQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(CustomerType)
    type?: CustomerType;

    @IsOptional()
    @IsEnum(CustomerStatus)
    status?: CustomerStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;

    @IsOptional()
    @IsEnum(CustomerSortBy)
    sortBy: CustomerSortBy = CustomerSortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = SortOrder.DESC;
}