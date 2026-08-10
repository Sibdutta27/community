import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        // Prisma schema-qualifies every generated query, so neither the
        // `?schema=` URL param nor a role-level `search_path` can redirect
        // it — the adapter has to be told explicitly. `DATABASE_SCHEMA`
        // selects the deployment lane (unset => `public`, i.e. unchanged).
        const schema = configService.get<string>('DATABASE_SCHEMA')?.trim();

        const adapter = new PrismaPg(
            { connectionString: configService.getOrThrow<string>('DATABASE_URL') },
            schema ? { schema } : undefined,
        );

        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.$queryRaw`SELECT 1`;
            console.log('SUCCESS:: Prisma connected to PgSQL database');
        } catch (error) {
            // Do NOT rethrow: on serverless a bad/cold DB connection would otherwise
            // fail Nest init and 500 every route (incl. /health). Log and continue;
            // DB-touching routes will surface their own errors.
            console.error('ERROR:: Prisma connection error:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('INFO:: Prisma disconnected from MySQL');
    }
}