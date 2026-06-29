import { Module } from '@nestjs/common';
import { AdminCulturalConnectionController } from './adminCulturalConnection.controller';
import { AdminCulturalConnectionService } from './adminCulturalConnection.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
    controllers: [
        AdminCulturalConnectionController
    ],
    providers: [
        AdminCulturalConnectionService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class AdminCulturalConnectionModule { }