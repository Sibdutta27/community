import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { AdminUserModule } from './adminUser/adminUser.module';
import { AdminEnrollmentModule } from './adminEnrollment/adminEnrollment.module';
import { AdminCulturalConnectionModule } from './adminCulturalConnection/adminCulturalConnection.module';
import { AdminConsentModule } from './adminConsent/adminConsent.module';
import { AdminServiceModule } from './adminService/adminService.module';
import { AdminEventModule } from './adminEvent/adminEvent.module';
import { AdminFeedbackModule } from './adminFeedback/adminFeedback.module';

@Module({
    imports: [
        DatabaseModule,
        AdminUserModule,
        AdminEnrollmentModule,
        AdminCulturalConnectionModule,
        AdminConsentModule,
        AdminServiceModule,
        AdminEventModule,
        AdminFeedbackModule
    ],
})
export class AdminModule {}
