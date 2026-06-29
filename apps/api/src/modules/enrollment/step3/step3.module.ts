import { Module } from '@nestjs/common';
import { Step3Controller } from './step3.controller';
import { Step3Service } from './step3.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentStepService } from '../common/services/enrollmentStep.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
    controllers: [Step3Controller],
    providers: [
        Step3Service,
        EnrollmentStepService,
    ],
    imports: [
        DatabaseModule,
        UserModule,
    ],
})
export class Step3Module { }