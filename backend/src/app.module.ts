import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { NotesModule } from './notes/notes.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    AddressesModule,
    NotesModule,
    DocumentsModule,
    ActivitiesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

