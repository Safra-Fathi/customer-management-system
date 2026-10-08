import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {
    Request,
    Response,
} from 'express';
import { diskStorage } from 'multer';
import {
    extname,
    resolve,
} from 'path';
import {
    existsSync,
} from 'fs';
import { randomUUID } from 'crypto';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { DocumentsService } from './documents.service.js';

interface AuthenticatedRequest
    extends Request {
    user: JwtPayload;
}

@Controller(
    'customers/:customerId/documents',
)
@UseGuards(AuthGuard)
export class DocumentsController {
    constructor(
        private readonly documentsService: DocumentsService,
    ) { }

    /*
     * Upload customer document
     *
     * POST
     * /api/customers/:customerId/documents
     */
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination:
                    './uploads',

                filename: (
                    _request,
                    file,
                    callback,
                ) => {
                    const extension =
                        extname(
                            file.originalname,
                        ).toLowerCase();

                    const storedName =
                        `${randomUUID()}${extension}`;

                    callback(
                        null,
                        storedName,
                    );
                },
            }),

            limits: {
                fileSize:
                    10 *
                    1024 *
                    1024,
            },

            fileFilter: (
                _request,
                file,
                callback,
            ) => {
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                ];

                if (
                    !allowedTypes.includes(
                        file.mimetype,
                    )
                ) {
                    return callback(
                        new Error(
                            'Only PDF, JPEG and PNG documents are allowed',
                        ),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    create(
        @Param('customerId')
        customerId: string,

        @Body()
        dto: CreateDocumentDto,

        @UploadedFile()
        file: Express.Multer.File,

        @Req()
        request: AuthenticatedRequest,
    ) {
        return this.documentsService.create(
            customerId,
            dto,
            file,
            request.user.sub,
        );
    }

    /*
     * Securely retrieve a customer document.
     *
     * GET
     * /api/customers/:customerId/documents/:documentId/download
     */
    @Get(':documentId/download')
    async download(
        @Param('customerId')
        customerId: string,

        @Param('documentId')
        documentId: string,

        @Res()
        response: Response,
    ) {
        const document =
            await this.documentsService.findOneForDownload(
                customerId,
                documentId,
            );

        /*
         * filePath comes from our own database record,
         * not from a user-provided path.
         */
        const absolutePath =
            resolve(document.filePath);

        if (!existsSync(absolutePath)) {
            throw new NotFoundException(
                'Document file is no longer available',
            );
        }

        response.setHeader(
            'Content-Type',
            document.mimeType,
        );

        response.setHeader(
            'Content-Length',
            document.fileSize.toString(),
        );

        /*
         * "inline" lets PDFs/images open in the browser.
         * Users can still save/download them from the browser.
         */
        response.setHeader(
            'Content-Disposition',
            `inline; filename="${sanitizeFileName(
                document.fileName,
            )}"`,
        );

        return response.sendFile(
            absolutePath,
        );
    }
}

function sanitizeFileName(
    fileName: string,
) {
    return fileName
        .replace(/[\r\n"]/g, '')
        .replace(/[\\/]/g, '_');
}