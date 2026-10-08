import {
    Body,
    Controller,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { NotesService } from './notes.service.js';

interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}

@Controller('customers/:customerId/notes')
@UseGuards(AuthGuard)
export class NotesController {
    constructor(
        private readonly notesService: NotesService,
    ) { }

    @Post()
    create(
        @Param('customerId') customerId: string,
        @Body() dto: CreateNoteDto,
        @Req() request: AuthenticatedRequest,
    ) {
        return this.notesService.create(
            customerId,
            dto,
            request.user.sub,
        );
    }
}