import { Module } from '@nestjs/common';
import { Step2Controller } from './step2.controller';
import { Step2Service } from './step2.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentStepService } from '../common/services/enrollmentStep.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
    controllers: [Step2Controller],
    providers: [
        Step2Service,
        EnrollmentStepService,
    ],
    imports: [
        DatabaseModule,
        UserModule,
    ],
})
export class Step2Module { }