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
import { CreateNoteDto } from './dto/create-note.dto.js';

@Injectable()
export class NotesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        customerId: string,
        dto: CreateNoteDto,
        actorId: string,
    ) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                status: true,
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        if (customer.status === CustomerStatus.ARCHIVED) {
            throw new BadRequestException(
                'Notes cannot be added to an archived customer',
            );
        }

        const note = await this.prisma.$transaction(
            async (tx) => {
                const createdNote = await tx.customerNote.create({
                    data: {
                        customerId,
                        authorId: actorId,
                        note: dto.note.trim(),
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
                });

                await tx.activity.create({
                    data: {
                        customerId,
                        actorId,
                        action: ActivityType.NOTE_ADDED,
                    },
                });

                return createdNote;
            },
        );

        return {
            success: true,
            data: note,
        };
    }
}