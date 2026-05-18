import { Module } from '@nestjs/common';
import { AdminEventController } from './adminEvent.controller';
import { AdminEventService } from './adminEvent.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
    controllers: [
        AdminEventController
    ],
    providers: [
        AdminEventService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class AdminEventModule { }