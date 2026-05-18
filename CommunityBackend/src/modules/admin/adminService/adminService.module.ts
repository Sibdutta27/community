import { Module } from '@nestjs/common';
import { AdminServiceController } from './adminService.controller';
import { AdminServiceService } from './adminService.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
    controllers: [
        AdminServiceController
    ],
    providers: [
        AdminServiceService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class AdminServiceModule { }