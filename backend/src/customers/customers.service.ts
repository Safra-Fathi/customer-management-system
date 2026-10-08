import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    ActivityType,
    CustomerStatus,
    CustomerType,
} from '../generated/prisma/enums.js';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateCustomerDto } from './dto/create-customer.dto.js';

import {
    CustomerQueryDto,
    CustomerSortBy,
    SortOrder,
} from './dto/customer-query.dto.js';

import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /* =========================================================
       CREATE CUSTOMER
    ========================================================= */

    async create(
        dto: CreateCustomerDto,
        actorId: string,
    ) {
        this.validateCustomerType(dto);

        const customer =
            await this.prisma.$transaction(
                async (tx) => {
                    const createdCustomer =
                        await tx.customer.create({
                            data: {
                                type: dto.type,

                                firstName:
                                    dto.type ===
                                        CustomerType.INDIVIDUAL
                                        ? dto.firstName?.trim()
                                        : null,

                                lastName:
                                    dto.type ===
                                        CustomerType.INDIVIDUAL
                                        ? dto.lastName?.trim()
                                        : null,

                                businessName:
                                    dto.type ===
                                        CustomerType.BUSINESS
                                        ? dto.businessName?.trim()
                                        : null,

                                email: dto.email
                                    .trim()
                                    .toLowerCase(),

                                phone: dto.phone.trim(),
                            },
                        });

                    await tx.activity.create({
                        data: {
                            customerId:
                                createdCustomer.id,

                            actorId,

                            action:
                                ActivityType.CUSTOMER_CREATED,
                        },
                    });

                    return createdCustomer;
                },
            );

        return {
            success: true,
            data: customer,
        };
    }

    /* =========================================================
       CUSTOMER LIST / SEARCH
    ========================================================= */

    async findAll(
        query: CustomerQueryDto,
    ) {
        const {
            search,
            type,
            status,
            page,
            limit,
            sortBy,
            sortOrder,
        } = query;

        const conditions: any[] = [];

        /* -----------------------------------------------------
           TYPE FILTER
        ----------------------------------------------------- */

        if (type) {
            conditions.push({
                type,
            });
        }

        /* -----------------------------------------------------
           STATUS FILTER
        ----------------------------------------------------- */

        if (status) {
            conditions.push({
                status,
            });
        } else {
            /*
             * Archived customers are hidden from
             * the default customer list.
             *
             * They can still be retrieved by
             * explicitly filtering status=ARCHIVED.
             */
            conditions.push({
                status: {
                    not: CustomerStatus.ARCHIVED,
                },
            });
        }

        /* -----------------------------------------------------
           SEARCH
        ----------------------------------------------------- */

        if (search?.trim()) {
            const searchTerm =
                search.trim();

            const searchConditions: any[] = [
                {
                    firstName: {
                        contains:
                            searchTerm,

                        mode: 'insensitive',
                    },
                },

                {
                    lastName: {
                        contains:
                            searchTerm,

                        mode: 'insensitive',
                    },
                },

                {
                    businessName: {
                        contains:
                            searchTerm,

                        mode: 'insensitive',
                    },
                },

                {
                    email: {
                        contains:
                            searchTerm,

                        mode: 'insensitive',
                    },
                },

                {
                    phone: {
                        contains:
                            searchTerm,
                    },
                },
            ];

            /*
             * Search the human-readable customer ID.
             *
             * Example:
             * CUS-000001 -> customerNumber = 1
             */
            const customerNumber =
                this.parseCustomerNumber(
                    searchTerm,
                );

            if (customerNumber !== null) {
                searchConditions.push({
                    customerNumber,
                });
            }

            /*
             * Only search the UUID column if
             * the entered value is actually a UUID.
             */
            if (
                this.isUuid(searchTerm)
            ) {
                searchConditions.push({
                    id: searchTerm,
                });
            }

            conditions.push({
                OR: searchConditions,
            });
        }

        const where =
            conditions.length > 0
                ? {
                    AND: conditions,
                }
                : {};

        const skip =
            (page - 1) * limit;

        const orderBy = {
            [sortBy ??
                CustomerSortBy.CREATED_AT]:
                sortOrder ??
                SortOrder.DESC,
        };

        const [customers, total] =
            await this.prisma.$transaction([
                this.prisma.customer.findMany({
                    where,

                    skip,

                    take: limit,

                    orderBy,

                    select: {
                        id: true,

                        customerNumber: true,

                        type: true,

                        firstName: true,
                        lastName: true,

                        businessName: true,

                        email: true,
                        phone: true,

                        status: true,

                        createdAt: true,
                        updatedAt: true,
                    },
                }),

                this.prisma.customer.count({
                    where,
                }),
            ]);

        return {
            success: true,

            data: customers,

            meta: {
                page,
                limit,
                total,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),
            },
        };
    }

    /* =========================================================
       CUSTOMER PROFILE
    ========================================================= */

    async findOne(id: string) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id,
                },

                include: {
                    /* -----------------------------------------
                       ADDRESSES
                    ----------------------------------------- */

                    addresses: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },

                    /* -----------------------------------------
                       NOTES
                    ----------------------------------------- */

                    notes: {
                        orderBy: {
                            createdAt: 'desc',
                        },

                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },

                    /* -----------------------------------------
                       DOCUMENTS

                       filePath is intentionally NOT selected.
                       The physical server storage path is an
                       internal implementation detail.
                    ----------------------------------------- */

                    documents: {
                        orderBy: {
                            uploadedAt: 'desc',
                        },

                        select: {
                            id: true,

                            customerId: true,

                            uploadedById: true,

                            fileName: true,

                            mimeType: true,

                            fileSize: true,

                            documentType: true,

                            uploadedAt: true,

                            uploadedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },

                    /* -----------------------------------------
                       ACTIVITY HISTORY
                    ----------------------------------------- */

                    activities: {
                        orderBy: {
                            createdAt: 'desc',
                        },

                        include: {
                            actor: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        return {
            success: true,
            data: customer,
        };
    }

    /* =========================================================
       UPDATE CUSTOMER
    ========================================================= */

    async update(
        id: string,
        dto: UpdateCustomerDto,
        actorId: string,
    ) {
        const existingCustomer =
            await this.prisma.customer.findUnique({
                where: {
                    id,
                },
            });

        if (!existingCustomer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        /*
         * Archived customer profiles are treated
         * as historical/read-only records.
         */
        if (
            existingCustomer.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Archived customers cannot be edited',
            );
        }

        /*
         * Archiving must go through the dedicated
         * archive operation so authorization and
         * audit logging remain consistent.
         */
        if (
            dto.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Use the archive endpoint to archive a customer',
            );
        }

        const resultingType =
            dto.type ??
            existingCustomer.type;

        const resultingCustomer = {
            type: resultingType,

            firstName:
                dto.firstName !== undefined
                    ? dto.firstName
                    : existingCustomer.firstName,

            lastName:
                dto.lastName !== undefined
                    ? dto.lastName
                    : existingCustomer.lastName,

            businessName:
                dto.businessName !== undefined
                    ? dto.businessName
                    : existingCustomer.businessName,
        };

        this.validateCustomerType(
            resultingCustomer,
        );

        const customer =
            await this.prisma.$transaction(
                async (tx) => {
                    const updatedCustomer =
                        await tx.customer.update({
                            where: {
                                id,
                            },

                            data: {
                                type:
                                    resultingType,

                                firstName:
                                    resultingType ===
                                        CustomerType.INDIVIDUAL
                                        ? resultingCustomer.firstName?.trim()
                                        : null,

                                lastName:
                                    resultingType ===
                                        CustomerType.INDIVIDUAL
                                        ? resultingCustomer.lastName?.trim()
                                        : null,

                                businessName:
                                    resultingType ===
                                        CustomerType.BUSINESS
                                        ? resultingCustomer.businessName?.trim()
                                        : null,

                                ...(dto.email !==
                                    undefined && {
                                    email:
                                        dto.email
                                            .trim()
                                            .toLowerCase(),
                                }),

                                ...(dto.phone !==
                                    undefined && {
                                    phone:
                                        dto.phone.trim(),
                                }),

                                ...(dto.status !==
                                    undefined && {
                                    status:
                                        dto.status,
                                }),
                            },
                        });

                    /*
                     * Record a specific activity
                     * when customer status changes.
                     *
                     * All other profile edits are
                     * recorded as CUSTOMER_UPDATED.
                     */
                    let activityAction:
                        ActivityType =
                        ActivityType.CUSTOMER_UPDATED;

                    if (
                        dto.status !==
                        undefined &&
                        dto.status !==
                        existingCustomer.status
                    ) {
                        if (
                            dto.status ===
                            CustomerStatus.ACTIVE
                        ) {
                            activityAction =
                                ActivityType.CUSTOMER_ACTIVATED;
                        } else if (
                            dto.status ===
                            CustomerStatus.INACTIVE
                        ) {
                            activityAction =
                                ActivityType.CUSTOMER_DEACTIVATED;
                        }
                    }

                    await tx.activity.create({
                        data: {
                            customerId: id,

                            actorId,

                            action:
                                activityAction,
                        },
                    });

                    return updatedCustomer;
                },
            );

        return {
            success: true,
            data: customer,
        };
    }

    /* =========================================================
       ARCHIVE CUSTOMER
    ========================================================= */

    async archive(
        id: string,
        actorId: string,
    ) {
        const existingCustomer =
            await this.prisma.customer.findUnique({
                where: {
                    id,
                },
            });

        if (!existingCustomer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        if (
            existingCustomer.status ===
            CustomerStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                'Customer is already archived',
            );
        }

        const customer =
            await this.prisma.$transaction(
                async (tx) => {
                    const archivedCustomer =
                        await tx.customer.update({
                            where: {
                                id,
                            },

                            data: {
                                status:
                                    CustomerStatus.ARCHIVED,
                            },
                        });

                    await tx.activity.create({
                        data: {
                            customerId: id,

                            actorId,

                            action:
                                ActivityType.CUSTOMER_ARCHIVED,
                        },
                    });

                    return archivedCustomer;
                },
            );

        return {
            success: true,

            message:
                'Customer archived successfully',

            data: customer,
        };
    }

    /* =========================================================
       CUSTOMER TYPE VALIDATION
    ========================================================= */

    private validateCustomerType(
        customer: {
            type: CustomerType;

            firstName?:
            | string
            | null;

            lastName?:
            | string
            | null;

            businessName?:
            | string
            | null;
        },
    ) {
        /*
         * Individual customers require both
         * first and last name.
         */
        if (
            customer.type ===
            CustomerType.INDIVIDUAL
        ) {
            if (
                !customer.firstName?.trim() ||
                !customer.lastName?.trim()
            ) {
                throw new BadRequestException(
                    'First name and last name are required for individual customers',
                );
            }
        }

        /*
         * Business customers require a
         * business name.
         */
        if (
            customer.type ===
            CustomerType.BUSINESS
        ) {
            if (
                !customer.businessName?.trim()
            ) {
                throw new BadRequestException(
                    'Business name is required for business customers',
                );
            }
        }
    }

    /* =========================================================
       CUSTOMER NUMBER SEARCH
    ========================================================= */

    private parseCustomerNumber(
        value: string,
    ): number | null {
        const normalizedValue =
            value.trim().toUpperCase();

        /*
         * Customer-facing format:
         *
         * CUS-000001
         * CUS-000025
         * CUS-001250
         */
        const formattedMatch =
            /^CUS-(\d+)$/.exec(
                normalizedValue,
            );

        if (formattedMatch) {
            const customerNumber =
                Number(
                    formattedMatch[1],
                );

            return Number.isSafeInteger(
                customerNumber,
            ) &&
                customerNumber > 0
                ? customerNumber
                : null;
        }

        /*
         * Also allow a direct numeric search.
         *
         * Example:
         * 25 -> customerNumber 25
         */
        if (
            /^\d+$/.test(
                normalizedValue,
            )
        ) {
            const customerNumber =
                Number(
                    normalizedValue,
                );

            return Number.isSafeInteger(
                customerNumber,
            ) &&
                customerNumber > 0
                ? customerNumber
                : null;
        }

        return null;
    }

    /* =========================================================
       UUID VALIDATION
    ========================================================= */

    private isUuid(
        value: string,
    ): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value,
        );
    }
}