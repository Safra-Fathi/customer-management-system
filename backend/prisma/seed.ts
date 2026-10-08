import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
    UserRole,
    UserStatus,
} from '../src/generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const staffName = process.env.STAFF_NAME;
    const staffEmail = process.env.STAFF_EMAIL;
    const staffPassword = process.env.STAFF_PASSWORD;

    if (
        !adminName ||
        !adminEmail ||
        !adminPassword ||
        !staffName ||
        !staffEmail ||
        !staffPassword
    ) {
        throw new Error(
            'Admin and staff seed environment variables are required',
        );
    }

    const adminPasswordHash = await argon2.hash(adminPassword);
    const staffPasswordHash = await argon2.hash(staffPassword);

    await prisma.user.upsert({
        where: {
            email: adminEmail.toLowerCase(),
        },
        update: {
            name: adminName,
            passwordHash: adminPasswordHash,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        },
        create: {
            name: adminName,
            email: adminEmail.toLowerCase(),
            passwordHash: adminPasswordHash,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        },
    });

    await prisma.user.upsert({
        where: {
            email: staffEmail.toLowerCase(),
        },
        update: {
            name: staffName,
            passwordHash: staffPasswordHash,
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
        },
        create: {
            name: staffName,
            email: staffEmail.toLowerCase(),
            passwordHash: staffPasswordHash,
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
        },
    });

    console.log('Seed users are ready.');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });