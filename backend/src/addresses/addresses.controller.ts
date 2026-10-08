import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { AuthGuard } from '../auth/guards/auth.guard.js';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { AddressesService } from './addresses.service.js';

import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

interface AuthenticatedRequest
    extends Request {
    user: JwtPayload;
}

@Controller(
    'customers/:customerId/addresses',
)
@UseGuards(AuthGuard)
export class AddressesController {
    constructor(
        private readonly addressesService: AddressesService,
    ) { }

    /* =====================================================
       CREATE
    ===================================================== */

    @Post()
    create(
        @Param('customerId')
        customerId: string,

        @Body()
        dto: CreateAddressDto,

        @Req()
        request: AuthenticatedRequest,
    ) {
        return this.addressesService.create(
            customerId,
            dto,
            request.user.sub,
        );
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    @Patch(':addressId')
    update(
        @Param('customerId')
        customerId: string,

        @Param('addressId')
        addressId: string,

        @Body()
        dto: UpdateAddressDto,

        @Req()
        request: AuthenticatedRequest,
    ) {
        return this.addressesService.update(
            customerId,
            addressId,
            dto,
            request.user.sub,
        );
    }

    /* =====================================================
       DELETE
    ===================================================== */

    @Delete(':addressId')
    remove(
        @Param('customerId')
        customerId: string,

        @Param('addressId')
        addressId: string,

        @Req()
        request: AuthenticatedRequest,
    ) {
        return this.addressesService.remove(
            customerId,
            addressId,
            request.user.sub,
        );
    }
}