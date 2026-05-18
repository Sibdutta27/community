import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.$queryRaw`SELECT 1`;
            console.log('SUCCESS:: Prisma connected to PgSQL database');
        } catch (error) {
            console.error('ERROR:: Prisma connection error:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('INFO:: Prisma disconnected from MySQL');
    }
}