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
import { CreateDocumentDto } from './dto/create-document.dto.js';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        customerId: string,
        dto: CreateDocumentDto,
        file: Express.Multer.File,
        actorId: string,
    ) {
        if (!file) {
            throw new BadRequestException(
                'Document file is required',
            );
        }

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
                'Documents cannot be added to an archived customer',
            );
        }

        const document =
            await this.prisma.$transaction(
                async (tx) => {
                    const createdDocument =
                        await tx.customerDocument.create({
                            data: {
                                customerId,

                                uploadedById:
                                    actorId,

                                fileName:
                                    file.originalname,

                                filePath:
                                    file.path.replace(
                                        /\\/g,
                                        '/',
                                    ),

                                mimeType:
                                    file.mimetype,

                                fileSize:
                                    file.size,

                                documentType:
                                    dto.documentType.trim(),
                            },

                            include: {
                                uploadedBy: {
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

                            action:
                                ActivityType.DOCUMENT_UPLOADED,
                        },
                    });

                    return createdDocument;
                },
            );

        return {
            success: true,
            data: this.toPublicDocument(document),
        };
    }

    async findOneForDownload(
        customerId: string,
        documentId: string,
    ) {
        /*
         * Query using both the document ID and customer ID.
         *
         * This prevents someone from taking a valid document
         * UUID from Customer A and requesting it through
         * Customer B's profile.
         */
        const document =
            await this.prisma.customerDocument.findFirst({
                where: {
                    id: documentId,
                    customerId,
                },
                select: {
                    id: true,
                    customerId: true,
                    fileName: true,
                    filePath: true,
                    mimeType: true,
                    fileSize: true,
                    documentType: true,
                    uploadedAt: true,
                },
            });

        if (!document) {
            throw new NotFoundException(
                'Document not found',
            );
        }

        return document;
    }

    private toPublicDocument<
        T extends {
            filePath: string;
        },
    >(document: T) {
        /*
         * filePath is an internal server implementation detail.
         * Never expose paths such as uploads/uuid.pdf to the
         * frontend.
         */
        const {
            filePath: _filePath,
            ...publicDocument
        } = document;

        return publicDocument;
    }
}