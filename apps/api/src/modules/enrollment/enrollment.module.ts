import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentStepService } from './common/services/enrollmentStep.service';
import { Step1Module } from './step1/step1.module';
import { Step2Module } from './step2/step2.module';
import { Step3Module } from './step3/step3.module';
import { Step4Module } from './step4/step4.module';
import { DocumentModule } from '../document/document.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [EnrollmentController],
  providers  : [
    EnrollmentService,
    EnrollmentStepService,
  ],
  imports : [
    DatabaseModule,
    UserModule,
    Step1Module,
    Step2Module,
    Step3Module,
    Step4Module,
    DocumentModule,
  ],
  exports : [
    EnrollmentStepService,
    EnrollmentService,
  ]
})
export class EnrollmentModule {}
