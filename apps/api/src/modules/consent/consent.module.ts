import { Module } from '@nestjs/common';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { DatabaseModule } from '@/database/database.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
  imports: [
    DatabaseModule,
    UserModule,
    EnrollmentModule
  ]
})
export class ConsentModule {}
