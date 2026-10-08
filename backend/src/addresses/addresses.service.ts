import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    ActivityType,
    CustomerStatus,
} from '../generated/prisma/enums.js';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /* =====================================================
       CREATE ADDRESS
    ===================================================== */

    async create(
        customerId: string,
        dto: CreateAddressDto,
        actorId: string,
    ) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        if (
            customer.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Addresses cannot be added to an archived customer',
            );
        }

        const address =
            await this.prisma.$transaction(
                async (tx) => {
                    const createdAddress =
                        await tx.address.create({
                            data: {
                                customerId,
                                type: dto.type,

                                addressLine1:
                                    dto.addressLine1.trim(),

                                addressLine2:
                                    dto.addressLine2?.trim(),

                                city: dto.city.trim(),

                                state:
                                    dto.state?.trim(),

                                postalCode:
                                    dto.postalCode?.trim(),

                                country:
                                    dto.country.trim(),
                            },
                        });

                    await tx.activity.create({
                        data: {
                            customerId,
                            actorId,
                            action:
                                ActivityType.ADDRESS_ADDED,
                        },
                    });

                    return createdAddress;
                },
            );

        return {
            success: true,
            data: address,
        };
    }

    /* =====================================================
       UPDATE ADDRESS
    ===================================================== */

    async update(
        customerId: string,
        addressId: string,
        dto: UpdateAddressDto,
        actorId: string,
    ) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        if (
            customer.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Addresses cannot be modified for an archived customer',
            );
        }

        /*
         * Matching both IDs is important.
         *
         * It prevents someone from taking an address ID
         * belonging to another customer and modifying it
         * through this customer's URL.
         */
        const existingAddress =
            await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    customerId,
                },
            });

        if (!existingAddress) {
            throw new NotFoundException(
                'Address not found',
            );
        }

        const address =
            await this.prisma.$transaction(
                async (tx) => {
                    const updatedAddress =
                        await tx.address.update({
                            where: {
                                id: addressId,
                            },
                            data: {
                                ...(dto.type !==
                                    undefined && {
                                    type: dto.type,
                                }),

                                ...(dto.addressLine1 !==
                                    undefined && {
                                    addressLine1:
                                        dto.addressLine1.trim(),
                                }),

                                ...(dto.addressLine2 !==
                                    undefined && {
                                    addressLine2:
                                        dto.addressLine2.trim(),
                                }),

                                ...(dto.city !==
                                    undefined && {
                                    city: dto.city.trim(),
                                }),

                                ...(dto.state !==
                                    undefined && {
                                    state:
                                        dto.state.trim(),
                                }),

                                ...(dto.postalCode !==
                                    undefined && {
                                    postalCode:
                                        dto.postalCode.trim(),
                                }),

                                ...(dto.country !==
                                    undefined && {
                                    country:
                                        dto.country.trim(),
                                }),
                            },
                        });

                    await tx.activity.create({
                        data: {
                            customerId,
                            actorId,
                            action:
                                ActivityType.ADDRESS_UPDATED,
                        },
                    });

                    return updatedAddress;
                },
            );

        return {
            success: true,
            data: address,
        };
    }

    /* =====================================================
       DELETE ADDRESS
    ===================================================== */

    async remove(
        customerId: string,
        addressId: string,
        actorId: string,
    ) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        if (
            customer.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Addresses cannot be removed from an archived customer',
            );
        }

        const existingAddress =
            await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    customerId,
                },
            });

        if (!existingAddress) {
            throw new NotFoundException(
                'Address not found',
            );
        }

        await this.prisma.$transaction(
            async (tx) => {
                await tx.address.delete({
                    where: {
                        id: addressId,
                    },
                });

                await tx.activity.create({
                    data: {
                        customerId,
                        actorId,
                        action:
                            ActivityType.ADDRESS_DELETED,
                    },
                });
            },
        );

        return {
            success: true,
            message:
                'Address deleted successfully',
        };
    }
}