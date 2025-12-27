import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('\n=== Generate Invite Code ===\n');

    try {
        // Generate random code like "INV-A1B2-C3D4"
        const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
        const code = `INV-${randomBytes.substring(0, 4)}-${randomBytes.substring(4)}`;

        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.inviteCode.create({
            data: {
                code,
                expiresAt,
            },
        });

        console.log(`Code Generated: \x1b[32m${invite.code}\x1b[0m`);
        console.log(`Expires: ${invite.expiresAt.toISOString()}`);
        console.log('Share this code with the new user.');

    } catch (error: any) {
        console.error('\nError:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
