import { Module } from '@nestjs/common';
import { Step1Controller } from './step1.controller';
import { Step1Service } from './step1.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentStepService } from '../common/services/enrollmentStep.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
    controllers: [Step1Controller],
    providers: [
        Step1Service,
        EnrollmentStepService,
    ],
    imports: [
        DatabaseModule,
        UserModule,
    ],
})
export class Step1Module { }