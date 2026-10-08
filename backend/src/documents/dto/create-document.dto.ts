import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    documentType!: string;

    @IsOptional()
    file?: unknown;
}