import { Module } from '@nestjs/common';
import { AdminEnrollmentController } from './adminEnrollment.controller';
import { AdminEnrollmentService } from './adminEnrollment.service';
import { DatabaseModule } from '@/database/database.module';
import { UserModule } from '@/modules/user/user.module';
import { DocumentModule } from '@/modules/document/document.module';
import { AdminEnrollmentStep4Service } from './services/adminEnrollmentStep4.service';
import { AdminEnrollmentStep3Service } from './services/adminEnrollmentStep3.service';
import { AdminEnrollmentStep2Service } from './services/adminEnrollmentStep2.service';
import { AdminEnrollmentStep1Service } from './services/adminEnrollmentStep1.service';

@Module({
    controllers: [
        AdminEnrollmentController
    ],
    providers: [
        AdminEnrollmentService,
        AdminEnrollmentStep4Service,
        AdminEnrollmentStep3Service,
        AdminEnrollmentStep2Service,
        AdminEnrollmentStep1Service,
    ],
    imports: [
        DatabaseModule,
        DocumentModule,
        UserModule,
    ],
})
export class AdminEnrollmentModule { }