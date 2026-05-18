import { Module } from '@nestjs/common';
import { Step4Controller } from './step4.controller';
import { Step4Service } from './step4.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentStepService } from '../common/services/enrollmentStep.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
    controllers: [Step4Controller],
    providers: [
        Step4Service,
        EnrollmentStepService,
    ],
    imports: [
        DatabaseModule,
        UserModule,
    ],
})
export class Step4Module { }