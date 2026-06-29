import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  providers: [AccountService],
  controllers: [AccountController],
  imports: [
    UserModule,
    EnrollmentModule,
  ],
})
export class AccountModule {}
