import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { UserRole } from '../generated/prisma/enums.js';

import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { CustomerQueryDto } from './dto/customer-query.dto.js';

interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
    ) { }

    @Post()
    create(
        @Body() dto: CreateCustomerDto,
        @Req() request: AuthenticatedRequest,
    ) {
        return this.customersService.create(
            dto,
            request.user.sub,
        );
    }

    @Get()
    findAll(@Query() query: CustomerQueryDto) {
        return this.customersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCustomerDto,
        @Req() request: AuthenticatedRequest,
    ) {
        return this.customersService.update(
            id,
            dto,
            request.user.sub,
        );
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    archive(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ) {
        return this.customersService.archive(
            id,
            request.user.sub,
        );
    }
}