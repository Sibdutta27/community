import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { DocumentModule } from './modules/document/document.module';
import { ConsentModule } from './modules/consent/consent.module';
import { AccountModule } from './modules/account/account.module';
import { ProfileModule } from './modules/profile/profile.module';
import { HealthController } from './health.controller';
import { ServiceModule } from './modules/service/service.module';
import { EventModule } from './modules/event/event.module';
import { AdminModule } from './modules/admin/admin.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ContentModule } from './modules/content/content.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    EnrollmentModule,
    DocumentModule,
    ConsentModule,
    AccountModule,
    ProfileModule,
    ServiceModule,
    EventModule,
    AdminModule,
    FeedbackModule,
    ContentModule,
  ],
})

export class AppModule { }
