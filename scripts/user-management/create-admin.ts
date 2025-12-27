import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n=== Create Admin User ===\n');

    try {
        const email = await question('Email: ');
        if (!email) throw new Error('Email is required');

        const name = await question('Name (optional): ');

        const password = await question('Password: ');
        if (!password) throw new Error('Password is required');

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.error('\nError: User with this email already exists.');
            process.exit(1);
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name: name || undefined,
                password: hashedPassword,
            },
        });

        console.log(`\nSuccess! Admin user created with ID: ${user.id}`);
        console.log('You can now login at /login');

    } catch (error: any) {
        console.error('\nError:', error.message);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
