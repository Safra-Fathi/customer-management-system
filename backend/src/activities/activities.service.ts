import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ActivitiesService {
    constructor(private readonly prisma: PrismaService) { }

    async findByCustomer(customerId: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: { id: true },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const activities = await this.prisma.activity.findMany({
            where: {
                customerId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: activities,
        };
    }
}