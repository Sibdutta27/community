import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [
    DatabaseModule,
    UserModule,
    EnrollmentModule,
  ],
})
export class ProfileModule { }
